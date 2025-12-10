import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ProductSearchPort } from '../../domain/ports/product-search.port';
import { PRODUCT_SEARCH_PORT } from '../../domain/ports/product-search.port';
import { AutocompleteQueryDto } from '../dtos/autocomplete.query.dto';
import { AutocompleteResponseDto } from '../dtos/autocomplete.response.dto';

@Injectable()
export class AutocompleteProductsUseCase {
  private readonly logger = new Logger(AutocompleteProductsUseCase.name);

  constructor(
    @Inject(PRODUCT_SEARCH_PORT)
    private readonly productSearchPort: ProductSearchPort,
  ) {}

  async execute(query: AutocompleteQueryDto): Promise<AutocompleteResponseDto> {
    this.logger.log(
      `Autocomplete products with query: ${JSON.stringify(query)}`,
    );
    const result = await this.productSearchPort.autocomplete(query);

    return {
      suggestions: result.suggestions,
    };
  }
}
