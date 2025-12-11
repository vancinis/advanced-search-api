import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ProductSearchPort } from '../../domain/ports/product-search.port';
import { PRODUCT_SEARCH_PORT } from '../../domain/ports/product-search.port';
import { ProductResponseDto } from '../dtos/product.response.dto';
import { SearchProductsQueryDto } from '../dtos/search-products.query.dto';
import { SearchProductsResponseDto } from '../dtos/search-products.response.dto';

@Injectable()
export class SearchProductsUseCase {
  private readonly logger = new Logger(SearchProductsUseCase.name);

  constructor(
    @Inject(PRODUCT_SEARCH_PORT)
    private readonly productSearchPort: ProductSearchPort,
  ) {}

  async execute(
    query: SearchProductsQueryDto,
  ): Promise<SearchProductsResponseDto> {
    this.logger.log(`Searching products with query: ${JSON.stringify(query)}`);

    const result = await this.productSearchPort.search(query);

    return {
      items: result.items.map((item) => ProductResponseDto.fromDomain(item)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      facets: result.facets,
      suggestedQuery: result.suggestedQuery,
    };
  }
}
