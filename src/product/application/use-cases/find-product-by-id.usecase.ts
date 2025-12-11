import { ProductNotFoundException } from '@/product/domain/exceptions/product.exception';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ProductSearchPort } from '../../domain/ports/product-search.port';
import { PRODUCT_SEARCH_PORT } from '../../domain/ports/product-search.port';
import { ProductResponseDto } from '../dtos/product.response.dto';

@Injectable()
export class FindProductByIdUseCase {
  private readonly logger = new Logger(FindProductByIdUseCase.name);

  constructor(
    @Inject(PRODUCT_SEARCH_PORT)
    private readonly productSearchPort: ProductSearchPort,
  ) {}

  async execute(id: string): Promise<ProductResponseDto> {
    this.logger.log(`Finding product by id: ${id}`);

    const product = await this.productSearchPort.findById(id);

    if (!product) {
      throw new ProductNotFoundException(id);
    }

    return ProductResponseDto.fromDomain(product);
  }
}
