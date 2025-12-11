import { Client, estypes } from '@elastic/elasticsearch';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Product } from '../../../domain/entities/product.entity';
import {
  AutocompleteQuery,
  AutocompleteResult,
  FacetBucket,
  ProductSearchPort,
  SearchFilters,
  SearchResult,
} from '../../../domain/ports/product-search.port';
import { ElasticsearchQueryBuilder } from './elasticsearch-query.builder';
import {
  PRODUCT_MAPPING,
  PRODUCT_SETTINGS,
  ProductDocument,
} from './product.document';
import { ElasticsearchProductMapper } from './product.mapper';

@Injectable()
export class ElasticsearchProductAdapter
  implements ProductSearchPort, OnModuleInit
{
  private readonly logger = new Logger(ElasticsearchProductAdapter.name);
  private readonly client: Client;
  private readonly indexName: string;

  constructor(private readonly configService: ConfigService) {
    const node = this.configService.get<string>(
      'ELASTICSEARCH_NODE',
      'http://localhost:9200',
    );

    this.client = new Client({ node });
    this.indexName = this.configService.get<string>(
      'ELASTICSEARCH_INDEX',
      'products',
    );
  }

  async onModuleInit() {
    await this.ensureIndexExists();
  }

  /**
   * Crea el índice si no existe
   */
  private async ensureIndexExists(): Promise<void> {
    try {
      const exists = await this.client.indices.exists({
        index: this.indexName,
      });
      if (exists) {
        this.logger.log(`Index already exists: ${this.indexName}`);
        return;
      }

      this.logger.log(`Creating index: ${this.indexName}`);
      await this.client.indices.create({
        index: this.indexName,
        settings: PRODUCT_SETTINGS,
        mappings: PRODUCT_MAPPING,
      });

      this.logger.log(`Index created successfully: ${this.indexName}`);
    } catch (error) {
      this.logger.error(
        `Error ensuring index exists: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async search(filters: SearchFilters): Promise<SearchResult> {
    try {
      const query = ElasticsearchQueryBuilder.buildSearchQuery(filters);
      const sort = ElasticsearchQueryBuilder.buildSort(filters.sort);
      const aggs = ElasticsearchQueryBuilder.buildAggregations();

      const from = (filters.page - 1) * filters.limit;

      this.logger.debug(`Searching with filters: ${JSON.stringify(filters)}`);

      const response = await this.client.search({
        index: this.indexName,
        query,
        sort,
        aggs,
        from,
        size: filters.limit,
        track_total_hits: true,
      });

      const hits = response.hits.hits;
      const total =
        typeof response.hits.total === 'number'
          ? response.hits.total
          : (response.hits.total?.value ?? 0);

      const products = hits.map((hit) =>
        ElasticsearchProductMapper.toDomain(hit._source as ProductDocument),
      );

      // Construir facets
      const facets = this.buildFacetsFromAggregations(response.aggregations);

      // Opcional: sugerencia de consulta alternativa (si hay pocos resultados)
      let suggestedQuery: string | undefined;
      if (filters.text && total < 5) {
        suggestedQuery = await this.getSuggestedQuery(filters.text);
      }

      return {
        items: products,
        total,
        page: filters.page,
        limit: filters.limit,
        facets,
        suggestedQuery,
      };
    } catch (error) {
      this.logger.error(
        `Error searching products: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<Product | null> {
    try {
      this.logger.debug(`Finding product by id: ${id}`);

      const response = await this.client.search<ProductDocument>({
        index: this.indexName,
        query: {
          term: { id },
        },
      });

      if (response.hits.hits.length === 0) {
        return null;
      }

      return ElasticsearchProductMapper.toDomain(
        response.hits.hits[0]._source as ProductDocument,
      );
    } catch (error) {
      this.logger.error(
        `Error finding product by id: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async autocomplete(query: AutocompleteQuery): Promise<AutocompleteResult> {
    try {
      this.logger.debug(`Autocomplete query: ${query.text}`);

      const esQuery = ElasticsearchQueryBuilder.buildAutocompleteQuery(
        query.text,
      );

      const response = await this.client.search<ProductDocument>({
        index: this.indexName,
        query: esQuery,
        _source: ['name'],
        size: query.limit || 10,
      });

      const suggestions = response.hits.hits
        .map((hit) => hit._source?.name)
        .filter((name): name is string => typeof name === 'string');

      return {
        suggestions: [...new Set(suggestions)],
      };
    } catch (error) {
      this.logger.error(`Error in autocomplete: ${error.message}`, error.stack);
      throw error;
    }
  }

  async index(product: Product): Promise<void> {
    try {
      const document = ElasticsearchProductMapper.toDocument(product);

      await this.client.index({
        index: this.indexName,
        id: product.id,
        document,
        refresh: 'wait_for',
      });

      this.logger.log(`Product indexed: ${product.id}`);
    } catch (error) {
      this.logger.error(
        `Error indexing product: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async checkConnection(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      this.logger.error(`Elasticsearch connection failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Construye facets desde aggregations de ES
   */
  private buildFacetsFromAggregations(
    aggregations: Record<string, estypes.AggregationsAggregate> | undefined,
  ): Record<string, FacetBucket[]> | undefined {
    if (!aggregations) return undefined;

    const facets: Record<string, FacetBucket[]> = {};

    const mapTermsBuckets = (
      agg: estypes.AggregationsAggregate,
    ): FacetBucket[] => {
      if ('buckets' in agg && Array.isArray(agg.buckets)) {
        return agg.buckets.map((bucket: any) => ({
          key: String(bucket.key),
          count: bucket.doc_count || 0,
        }));
      }
      return [];
    };

    if (aggregations.categories) {
      facets.categories = mapTermsBuckets(aggregations.categories);
    }

    if (aggregations.subcategories) {
      facets.subcategories = mapTermsBuckets(aggregations.subcategories);
    }

    if (aggregations.price_ranges) {
      facets.price_ranges = mapTermsBuckets(aggregations.price_ranges);
    }

    return facets;
  }

  /**
   * Obtiene sugerencia de consulta alternativa (usando suggest API)
   */
  private async getSuggestedQuery(text: string): Promise<string | undefined> {
    try {
      const response = await this.client.search({
        index: this.indexName,
        suggest: {
          text_suggestion: {
            text,
            term: {
              field: 'name',
              suggest_mode: 'popular',
            },
          },
        },
      });

      return response.suggest?.text_suggestion?.[0]?.options?.[0]?.text;
    } catch (error) {
      this.logger.warn(`Error getting suggested query: ${error.message}`);
      return undefined;
    }
  }
}
