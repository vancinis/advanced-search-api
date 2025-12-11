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
  MaxLength,
  Min,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidGeoFilter', async: false })
class IsValidGeoFilter implements ValidatorConstraintInterface {
  validate(_value: any, args: ValidationArguments): boolean {
    const object = args.object as { lat?: number; lon?: number };
    if (object.lat || object.lon) {
      return !!(object.lat && object.lon);
    }
    return true;
  }

  defaultMessage() {
    return 'Both lat and lon must be provided together';
  }
}

@ValidatorConstraint({ name: 'isValidPriceRange', async: false })
class IsValidPriceRange implements ValidatorConstraintInterface {
  validate(_value: any, args: ValidationArguments): boolean {
    const object = args.object as { minPrice?: number; maxPrice?: number };
    if (object.minPrice !== undefined && object.maxPrice !== undefined) {
      return object.minPrice <= object.maxPrice;
    }
    return true;
  }

  defaultMessage() {
    return 'minPrice must be less than or equal to maxPrice';
  }
}

export class SearchProductsQueryDto {
  @ApiPropertyOptional({
    description: 'Text to search in product name and description',
    example: 'iPhone 15',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Search text must not exceed 500 characters',
  })
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
    if (typeof value === 'string') return value.split(',');

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
  @Validate(IsValidPriceRange)
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
