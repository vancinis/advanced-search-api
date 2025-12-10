import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../../domain/entities/product.entity';
import { ProductNotFoundException } from '../../../domain/exceptions/product.exception';
import { ProductRepositoryPort } from '../../../domain/ports/product-repository.port';
import { ProductMapper } from './product.mapper';
import { ProductOrmEntity } from './product.orm-entity';

@Injectable()
export class TypeOrmProductRepository implements ProductRepositoryPort {
  private readonly logger = new Logger(TypeOrmProductRepository.name);

  constructor(
    @InjectRepository(ProductOrmEntity)
    private readonly repository: Repository<ProductOrmEntity>,
  ) {}

  async save(product: Product): Promise<Product> {
    try {
      let ormEntity: ProductOrmEntity;

      const existing = await this.repository.findOne({
        where: { id: product.id },
      });

      if (existing) {
        ormEntity = ProductMapper.toOrmForUpdate(product, existing);
        this.logger.log(`Updating product with id: ${product.id}`);
      } else {
        ormEntity = ProductMapper.toOrmForCreate(product);
        this.logger.log(`Creating new product: ${product.name}`);
      }

      const saved = await this.repository.save(ormEntity);

      this.logger.log(`Product saved successfully with id: ${saved.id}`);

      return ProductMapper.toDomain(saved);
    } catch (error) {
      this.logger.error(`Error saving product: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findById(id: string): Promise<Product | null> {
    try {
      this.logger.debug(`Finding product by id: ${id}`);

      const ormEntity = await this.repository.findOne({
        where: { id },
      });

      if (!ormEntity) {
        this.logger.debug(`Product not found with id: ${id}`);
        return null;
      }

      return ProductMapper.toDomain(ormEntity);
    } catch (error) {
      this.logger.error(
        `Error finding product by id ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAll(page: number = 1, limit: number = 20): Promise<Product[]> {
    try {
      this.logger.debug(
        `Finding all products - page: ${page}, limit: ${limit}`,
      );

      const skip = (page - 1) * limit;

      const ormEntities = await this.repository.find({
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      return ProductMapper.toDomainMany(ormEntities);
    } catch (error) {
      this.logger.error(
        `Error finding all products: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.logger.log(`Deleting product with id: ${id}`);

      const result = await this.repository.delete(id);

      if (result.affected === 0) {
        throw new ProductNotFoundException(id);
      }

      this.logger.log(`Product deleted successfully with id: ${id}`);
    } catch (error) {
      this.logger.error(
        `Error deleting product ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.repository.count({
        where: { id },
      });

      return count > 0;
    } catch (error) {
      this.logger.error(
        `Error checking if product exists ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async count(): Promise<number> {
    try {
      return await this.repository.count();
    } catch (error) {
      this.logger.error(
        `Error counting products: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findAllForSync(batchSize: number = 100): Promise<Product[]> {
    try {
      this.logger.debug(`Finding all products for sync (batch: ${batchSize})`);

      const ormEntities = await this.repository.find({
        take: batchSize,
        order: { createdAt: 'ASC' },
      });

      return ProductMapper.toDomainMany(ormEntities);
    } catch (error) {
      this.logger.error(
        `Error finding products for sync: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async findByCategory(category: string): Promise<Product[]> {
    try {
      this.logger.debug(`Finding products by category: ${category}`);

      const ormEntities = await this.repository.find({
        where: { category },
        order: { createdAt: 'DESC' },
      });

      return ProductMapper.toDomainMany(ormEntities);
    } catch (error) {
      this.logger.error(
        `Error finding products by category: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
