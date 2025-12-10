import { estypes } from '@elastic/elasticsearch';
import { ProductSortOptions } from '../../../domain/contracts/sort-options';
import { SearchFilters } from '../../../domain/ports/product-search.port';

export class ElasticsearchQueryBuilder {
  static buildSearchQuery(
    filters: SearchFilters,
  ): estypes.QueryDslQueryContainer {
    const must: estypes.QueryDslQueryContainer[] = [];
    const filter: estypes.QueryDslQueryContainer[] = [];

    if (filters.text) {
      must.push({
        multi_match: {
          query: filters.text,
          fields: ['name^2', 'description'],
          fuzziness: 'AUTO',
          operator: 'and',
        },
      });
    }

    if (filters.category) {
      filter.push({
        term: { category: filters.category },
      });
    }

    if (filters.subcategories && filters.subcategories.length > 0) {
      filter.push({
        terms: { subcategories: filters.subcategories },
      });
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const priceRange: { gte?: number; lte?: number } = {};
      if (filters.minPrice !== undefined) priceRange.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) priceRange.lte = filters.maxPrice;

      filter.push({
        range: { price: priceRange },
      });
    }

    if (
      filters.lat !== undefined &&
      filters.lon !== undefined &&
      filters.radiusKm
    ) {
      filter.push({
        geo_distance: {
          distance: `${filters.radiusKm}km`,
          location: {
            lat: filters.lat,
            lon: filters.lon,
          },
        },
      });
    }

    if (must.length === 0 && filter.length === 0) {
      return { match_all: {} };
    }

    const query: estypes.QueryDslQueryContainer = {
      bool: {},
    };

    if (must.length > 0) query.bool!.must = must;
    if (filter.length > 0) query.bool!.filter = filter;

    return query;
  }

  static buildAggregations(): Record<
    string,
    estypes.AggregationsAggregationContainer
  > {
    return {
      categories: {
        terms: {
          field: 'category',
          size: 50,
        },
      },
      subcategories: {
        terms: {
          field: 'subcategories',
          size: 100,
        },
      },
      price_ranges: {
        range: {
          field: 'price',
          ranges: [
            { key: '0-50', to: 50 },
            { key: '50-100', from: 50, to: 100 },
            { key: '100-500', from: 100, to: 500 },
            { key: '500-1000', from: 500, to: 1000 },
            { key: '1000+', from: 1000 },
          ],
        },
      },
    };
  }

  static buildSort(sortOption?: string): estypes.SortOptions[] {
    switch (sortOption) {
      case ProductSortOptions.POPULARITY:
        return [
          { popularity: { order: 'desc' } },
          { _score: { order: 'desc' } },
        ];

      case ProductSortOptions.CREATED_AT:
        return [{ createdAt: { order: 'desc' } }];

      case ProductSortOptions.PRICE_ASC:
        return [{ price: { order: 'asc' } }];

      case ProductSortOptions.PRICE_DESC:
        return [{ price: { order: 'desc' } }];

      case ProductSortOptions.RELEVANCE:
      default:
        return [
          { _score: { order: 'desc' } },
          { popularity: { order: 'desc' } },
        ];
    }
  }

  static buildAutocompleteQuery(text: string): estypes.QueryDslQueryContainer {
    return {
      bool: {
        should: [
          {
            match: {
              'name.autocomplete': {
                query: text,
                boost: 3,
              },
            },
          },
          {
            match_phrase_prefix: {
              name: {
                query: text,
                boost: 2,
              },
            },
          },
          {
            fuzzy: {
              name: {
                value: text,
                fuzziness: 'AUTO',
                boost: 1,
              },
            },
          },
        ],
        minimum_should_match: 1,
      },
    };
  }
}
