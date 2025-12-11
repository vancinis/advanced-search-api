// src/product/application/dtos/autocomplete.query.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class AutocompleteQueryDto {
  @ApiProperty({ example: 'iph', minLength: 1 })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ example: 10, default: 5, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(20)
  limit: number = 5;
}
