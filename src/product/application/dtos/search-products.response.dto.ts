import { FacetBucket } from '@/product/domain/ports/product-search.port';
import { ApiProperty } from '@nestjs/swagger';
import { ProductResponseDto } from './product.response.dto';

export class SearchProductsResponseDto {
  @ApiProperty({ type: [ProductResponseDto] })
  items: ProductResponseDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({
    description: 'Facets by category, price, etc.',
    required: false,
    example: {
      category: [{ key: 'electronics', count: 50 }],
      price: [{ key: '0-100', count: 20 }],
    },
  })
  facets?: Record<string, FacetBucket[]>;

  @ApiProperty({
    description: 'Suggested query based on search',
    required: false,
    example: 'iphone 15',
  })
  suggestedQuery?: string;
}
