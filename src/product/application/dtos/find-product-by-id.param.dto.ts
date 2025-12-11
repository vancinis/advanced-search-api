import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class FindProductByIdParamDto {
  @ApiProperty({
    description: 'Product unique identifier (UUID v4)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'Product ID must be a valid UUID v4' })
  id: string;
}
