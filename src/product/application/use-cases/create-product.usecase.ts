import { Inject, Injectable, Logger } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity';
import {
  PRODUCT_REPOSITORY_PORT,
  type ProductRepositoryPort,
} from '../../domain/ports/product-repository.port';
import {
  PRODUCT_SEARCH_PORT,
  type ProductSearchPort,
} from '../../domain/ports/product-search.port';
import { CreateProductDto } from '../dtos/create-product.dto';
import { ProductResponseDto } from '../dtos/product.response.dto';

@Injectable()
export class CreateProductUseCase {
  private readonly logger = new Logger(CreateProductUseCase.name);

  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepository: ProductRepositoryPort,
    @Inject(PRODUCT_SEARCH_PORT)
    private readonly productSearchPort: ProductSearchPort,
  ) {}

  async execute(dto: CreateProductDto): Promise<ProductResponseDto> {
    this.logger.log(`Creating product: ${dto.name}`);

    const product = Product.create({
      name: dto.name,
      description: dto.description,
      category: dto.category,
      subcategories: dto.subcategories || [],
      price: dto.price,
      latitude: dto.latitude,
      longitude: dto.longitude,
    });

    let savedProduct: Product | undefined = undefined;
    try {
      savedProduct = await this.productRepository.save(product);
      this.logger.log(`Product saved to database: ${savedProduct.id}`);

      await this.productSearchPort.index(savedProduct);
      this.logger.log(`Product indexed in Elasticsearch: ${savedProduct.id}`);

      this.logger.log(`Product created successfully: ${savedProduct.id}`);
      return ProductResponseDto.fromDomain(savedProduct);
    } catch (error) {
      if (savedProduct?.id) {
        await this.productRepository.delete(savedProduct.id);
        this.logger.warn(
          `Rollback successful: Product deleted from database: ${savedProduct.id}`,
        );
      }

      this.logger.error(
        `Failed to create product: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }
}
