import { CACHE_PORT } from '@/product/domain/ports/cache.port';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { CachePort } from '../../domain/ports/cache.port';
import type { ProductSearchPort } from '../../domain/ports/product-search.port';
import { PRODUCT_SEARCH_PORT } from '../../domain/ports/product-search.port';
import { AutocompleteQueryDto } from '../dtos/autocomplete.query.dto';
import { AutocompleteResponseDto } from '../dtos/autocomplete.response.dto';

@Injectable()
export class AutocompleteProductsUseCase {
  private readonly logger = new Logger(AutocompleteProductsUseCase.name);
  private readonly CACHE_PREFIX = 'autocomplete';
  private readonly CACHE_TTL = 300; // 5 minutos

  constructor(
    @Inject(PRODUCT_SEARCH_PORT)
    private readonly productSearchPort: ProductSearchPort,
    @Inject(CACHE_PORT)
    private readonly cachePort: CachePort,
  ) {}

  async execute(query: AutocompleteQueryDto): Promise<AutocompleteResponseDto> {
    this.logger.log(
      `Autocomplete products with query: ${JSON.stringify(query)}`,
    );

    const normalizedText = query.text.trim().toLowerCase();
    const limit = query.limit || 5;

    const cacheKey = `${this.CACHE_PREFIX}:${normalizedText}:${limit}`;

    const cached = await this.cachePort.get<AutocompleteResponseDto>(cacheKey);
    if (cached) {
      this.logger.debug(`Returning cached suggestions for: ${query.text}`);
      return cached;
    }

    const result = await this.productSearchPort.autocomplete(query);

    await this.cachePort.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }
}
