import { ApiProperty } from '@nestjs/swagger';

export class AutocompleteResponseDto {
  @ApiProperty({ example: ['iphone 13', 'iphone 14 pro', 'iphone case'] })
  suggestions: string[];
}
