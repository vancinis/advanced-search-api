import { Product } from '../entities/product.entity';

export interface ProductRepositoryPort {
  save(product: Product): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findAll(page: number, limit: number): Promise<Product[]>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  count(): Promise<number>;
}

export const PRODUCT_REPOSITORY_PORT = Symbol('ProductRepositoryPort');
