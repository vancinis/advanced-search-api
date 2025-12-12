import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CACHE_PORT } from './domain/ports/cache.port';
import { PRODUCT_REPOSITORY_PORT } from './domain/ports/product-repository.port';
import { PRODUCT_SEARCH_PORT } from './domain/ports/product-search.port';

import { AutocompleteProductsUseCase } from './application/use-cases/autocomplete-products.usecase';
import { CreateProductUseCase } from './application/use-cases/create-product.usecase';
import { FindProductByIdUseCase } from './application/use-cases/find-product-by-id.usecase';
import { SearchProductsUseCase } from './application/use-cases/search-products.usecase';

import { ElasticsearchProductAdapter } from './infrastructure/adapters/elasticsearch/elasticsearch-product.adapter';
import { RedisCacheAdapter } from './infrastructure/adapters/redis/redis-cache.adapter';
import { ProductOrmEntity } from './infrastructure/adapters/typeorm/product.orm-entity';
import { TypeOrmProductRepository } from './infrastructure/adapters/typeorm/typeorm-product.repository';
import { ProductController } from './infrastructure/http/product.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductOrmEntity])],
  controllers: [ProductController],
  providers: [
    SearchProductsUseCase,
    AutocompleteProductsUseCase,
    FindProductByIdUseCase,
    CreateProductUseCase,
    // Elasticsearch Adapter implements ProductSearchPort
    {
      provide: PRODUCT_SEARCH_PORT,
      useClass: ElasticsearchProductAdapter,
    },
    // TypeORM Repository implements ProductRepositoryPort
    {
      provide: PRODUCT_REPOSITORY_PORT,
      useClass: TypeOrmProductRepository,
    },
    {
      provide: CACHE_PORT,
      useClass: RedisCacheAdapter,
    },
  ],
  exports: [PRODUCT_SEARCH_PORT, PRODUCT_REPOSITORY_PORT],
})
export class ProductModule {}
