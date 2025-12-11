import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../domain/entities/product.entity';

export class ProductResponseDto {
  @ApiProperty({ example: 'uuid-1234' })
  id: string;

  @ApiProperty({ example: 'iPhone 15 Pro' })
  name: string;

  @ApiProperty({ example: 'Latest Apple smartphone' })
  description: string;

  @ApiProperty({ example: 'Electronics' })
  category: string;

  @ApiProperty({ example: ['Smartphones', 'Apple'] })
  subcategories: string[];

  @ApiProperty({ example: 999.99 })
  price: number;

  @ApiProperty({ example: 40.7128 })
  latitude: number;

  @ApiProperty({ example: -74.006 })
  longitude: number;

  @ApiProperty({ example: 150 })
  popularity: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  static fromDomain(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      subcategories: product.subcategories,
      price: product.price,
      latitude: product.latitude,
      longitude: product.longitude,
      popularity: product.popularity,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
