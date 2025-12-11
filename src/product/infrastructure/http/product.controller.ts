import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AutocompleteQueryDto } from '../../application/dtos/autocomplete.query.dto';
import { AutocompleteResponseDto } from '../../application/dtos/autocomplete.response.dto';
import { FindProductByIdParamDto } from '../../application/dtos/find-product-by-id.param.dto';
import { ProductResponseDto } from '../../application/dtos/product.response.dto';
import { SearchProductsQueryDto } from '../../application/dtos/search-products.query.dto';
import { SearchProductsResponseDto } from '../../application/dtos/search-products.response.dto';
import { AutocompleteProductsUseCase } from '../../application/use-cases/autocomplete-products.usecase';
import { FindProductByIdUseCase } from '../../application/use-cases/find-product-by-id.usecase';
import { SearchProductsUseCase } from '../../application/use-cases/search-products.usecase';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(
    private readonly searchProductsUseCase: SearchProductsUseCase,
    private readonly autocompleteProductsUseCase: AutocompleteProductsUseCase,
    private readonly findProductByIdUseCase: FindProductByIdUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Search products with advanced filters',
    description:
      'Search products with multiple filters: text search, category, subcategories, price range, location (geo-distance), with pagination, sorting, and faceting support.',
  })
  @ApiResponse({
    status: 200,
    description: 'Products found successfully',
    type: SearchProductsResponseDto,
  })
  async search(
    @Query() query: SearchProductsQueryDto,
  ): Promise<SearchProductsResponseDto> {
    this.logger.log(`Search request: ${JSON.stringify(query)}`);
    return this.searchProductsUseCase.execute(query);
  }

  @Get('autocomplete')
  @ApiOperation({
    summary: 'Autocomplete product names',
    description: 'Get product name suggestions based on partial text input.',
  })
  @ApiResponse({
    status: 200,
    description: 'Suggestions retrieved successfully',
    type: AutocompleteResponseDto,
  })
  async autocomplete(
    @Query() query: AutocompleteQueryDto,
  ): Promise<AutocompleteResponseDto> {
    this.logger.log(`Autocomplete request: ${JSON.stringify(query)}`);
    return this.autocompleteProductsUseCase.execute(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get product by ID',
    description: 'Retrieve a single product by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'Product unique identifier (UUID)',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Product found',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid UUID format',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findById(
    @Param() params: FindProductByIdParamDto,
  ): Promise<ProductResponseDto> {
    this.logger.log(`Find by ID request: ${params.id}`);
    return this.findProductByIdUseCase.execute(params.id);
  }
}
