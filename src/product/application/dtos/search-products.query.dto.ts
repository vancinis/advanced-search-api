import type { ProductSortOption } from '@/product/domain/contracts/sort-options';
import {
  AVAILABLE_SORT_OPTIONS,
  ProductSortOptions,
} from '@/product/domain/contracts/sort-options';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidGeoFilter', async: false })
class IsValidGeoFilter implements ValidatorConstraintInterface {
  validate(value: any, args: any) {
    const object = args.object;
    if (object.lat || object.lon) {
      return !!(object.lat && object.lon);
    }
    return true;
  }

  defaultMessage() {
    return 'Both lat and lon must be provided together';
  }
}

export class SearchProductsQueryDto {
  @ApiPropertyOptional({
    description: 'Text to search in product name and description',
    example: 'iPhone 15',
  })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({
    description: 'Category to filter products',
    example: 'Electronics',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Subcategories to filter products',
    example: ['Smartphones', 'Apple'],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return [value];
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  subcategories?: string[];

  @ApiPropertyOptional({
    description: 'Minimum price to filter products',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Maximum price to filter products',
    example: 1000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  // --- Geo Location ---

  @ApiPropertyOptional({
    description: 'Latitude to filter products',
    example: 40.7128,
    minimum: -90,
    maximum: 90,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Validate(IsValidGeoFilter)
  lat?: number;

  @ApiPropertyOptional({
    description: 'Longitude to filter products',
    example: -74.006,
    minimum: -180,
    maximum: 180,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Validate(IsValidGeoFilter)
  lon?: number;

  @ApiPropertyOptional({
    description: 'Radius in kilometers to filter products',
    example: 10,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  radiusKm?: number;

  // --- Pagination ---

  @ApiPropertyOptional({
    description: 'Page number to filter products',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1) // Page 0 no existe usualmente
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Limit of products per page',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @Max(100)
  limit: number = 20;

  // --- Sorting ---

  @ApiPropertyOptional({
    description: 'Sort order for results',
    example: ProductSortOptions.RELEVANCE,
    enum: AVAILABLE_SORT_OPTIONS,
    default: ProductSortOptions.RELEVANCE,
  })
  @IsOptional()
  @IsString()
  @IsIn(AVAILABLE_SORT_OPTIONS, {
    message: `Sort must be one of: ${AVAILABLE_SORT_OPTIONS.join(', ')}`,
  })
  sort: ProductSortOption = ProductSortOptions.RELEVANCE;
}
