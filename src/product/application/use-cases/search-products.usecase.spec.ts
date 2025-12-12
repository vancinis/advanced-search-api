import { Test, TestingModule } from '@nestjs/testing';
import { Product } from '../../domain/entities/product.entity';
import {
  PRODUCT_SEARCH_PORT,
  ProductSearchPort,
  SearchResult,
} from '../../domain/ports/product-search.port';
import { SearchProductsQueryDto } from '../dtos/search-products.query.dto';
import { SearchProductsUseCase } from './search-products.usecase';

describe('SearchProductsUseCase', () => {
  let useCase: SearchProductsUseCase;
  let mockProductSearchPort: jest.Mocked<ProductSearchPort>;

  beforeEach(async () => {
    mockProductSearchPort = {
      search: jest.fn(),
      findById: jest.fn(),
      autocomplete: jest.fn(),
      index: jest.fn(),
      checkConnection: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchProductsUseCase,
        {
          provide: PRODUCT_SEARCH_PORT,
          useValue: mockProductSearchPort,
        },
      ],
    }).compile();

    useCase = module.get<SearchProductsUseCase>(SearchProductsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockProduct = (id: string, name: string): Product => {
    return Product.reconstitute({
      id,
      name,
      description: `Description for ${name}`,
      category: 'Electronics',
      subcategories: ['Laptops'],
      price: 999.99,
      latitude: 40.7128,
      longitude: -74.006,
      popularity: 100,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });
  };

  describe('execute', () => {
    it('should search products successfully with text query', async () => {
      const query: SearchProductsQueryDto = {
        text: 'laptop',
        page: 1,
        limit: 20,
        sort: 'relevance',
      };

      const mockProduct = createMockProduct('1', 'Laptop Pro');
      const mockSearchResult: SearchResult = {
        items: [mockProduct],
        total: 1,
        page: 1,
        limit: 20,
      };

      mockProductSearchPort.search.mockResolvedValue(mockSearchResult);

      const result = await useCase.execute(query);

      expect(mockProductSearchPort.search).toHaveBeenCalledWith(query);
      expect(mockProductSearchPort.search).toHaveBeenCalledTimes(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Laptop Pro');
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should search with all filters combined', async () => {
      const query: SearchProductsQueryDto = {
        text: 'laptop',
        category: 'Electronics',
        subcategories: ['Laptops', 'Computers'],
        minPrice: 500,
        maxPrice: 2000,
        lat: 40.7128,
        lon: -74.006,
        radiusKm: 10,
        page: 2,
        limit: 10,
        sort: 'price_asc',
      };

      const mockProduct = createMockProduct('1', 'Laptop Pro');
      const mockSearchResult: SearchResult = {
        items: [mockProduct],
        total: 50,
        page: 2,
        limit: 10,
      };

      mockProductSearchPort.search.mockResolvedValue(mockSearchResult);

      const result = await useCase.execute(query);

      expect(mockProductSearchPort.search).toHaveBeenCalledWith(query);
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(50);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
    });

    it('should handle empty results', async () => {
      const query: SearchProductsQueryDto = {
        text: 'nonexistent',
        page: 1,
        limit: 20,
        sort: 'relevance',
      };

      const mockSearchResult: SearchResult = {
        items: [],
        total: 0,
        page: 1,
        limit: 20,
      };

      mockProductSearchPort.search.mockResolvedValue(mockSearchResult);

      const result = await useCase.execute(query);

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should map multiple products correctly', async () => {
      const query: SearchProductsQueryDto = {
        text: 'laptop',
        page: 1,
        limit: 20,
        sort: 'relevance',
      };

      const mockProducts = [
        createMockProduct('1', 'Laptop Pro'),
        createMockProduct('2', 'Gaming Laptop'),
        createMockProduct('3', 'Business Laptop'),
      ];

      const mockSearchResult: SearchResult = {
        items: mockProducts,
        total: 3,
        page: 1,
        limit: 20,
      };

      mockProductSearchPort.search.mockResolvedValue(mockSearchResult);

      const result = await useCase.execute(query);

      expect(result.items).toHaveLength(3);
      expect(result.items[0].name).toBe('Laptop Pro');
      expect(result.items[1].name).toBe('Gaming Laptop');
      expect(result.items[2].name).toBe('Business Laptop');
    });

    it('should propagate facets from search result', async () => {
      const query: SearchProductsQueryDto = {
        text: 'laptop',
        page: 1,
        limit: 20,
        sort: 'relevance',
      };

      const mockProduct = createMockProduct('1', 'Laptop Pro');
      const mockSearchResult: SearchResult = {
        items: [mockProduct],
        total: 1,
        page: 1,
        limit: 20,
        facets: {
          categories: [{ key: 'Electronics', count: 50 }],
          subcategories: [{ key: 'Laptops', count: 30 }],
          price_ranges: [{ key: '500-1000', count: 20 }],
        },
      };

      mockProductSearchPort.search.mockResolvedValue(mockSearchResult);

      const result = await useCase.execute(query);

      expect(result.facets).toBeDefined();
      expect(result.facets?.categories).toHaveLength(1);
      expect(result.facets?.categories[0].key).toBe('Electronics');
      expect(result.facets?.categories[0].count).toBe(50);
    });

    it('should propagate suggested query from search result', async () => {
      const query: SearchProductsQueryDto = {
        text: 'lapton', // typo
        page: 1,
        limit: 20,
        sort: 'relevance',
      };

      const mockProduct = createMockProduct('1', 'Laptop Pro');
      const mockSearchResult: SearchResult = {
        items: [mockProduct],
        total: 1,
        page: 1,
        limit: 20,
        suggestedQuery: 'laptop',
      };

      mockProductSearchPort.search.mockResolvedValue(mockSearchResult);

      const result = await useCase.execute(query);

      expect(result.suggestedQuery).toBe('laptop');
    });

    it('should handle pagination correctly', async () => {
      const query: SearchProductsQueryDto = {
        text: 'laptop',
        page: 3,
        limit: 5,
        sort: 'relevance',
      };

      const mockProduct = createMockProduct('1', 'Laptop Pro');
      const mockSearchResult: SearchResult = {
        items: [mockProduct],
        total: 50,
        page: 3,
        limit: 5,
      };

      mockProductSearchPort.search.mockResolvedValue(mockSearchResult);

      const result = await useCase.execute(query);

      expect(result.page).toBe(3);
      expect(result.limit).toBe(5);
      expect(result.total).toBe(50);
    });

    it('should work with category-only filter', async () => {
      const query: SearchProductsQueryDto = {
        category: 'Electronics',
        page: 1,
        limit: 20,
        sort: 'relevance',
      };

      const mockProduct = createMockProduct('1', 'Laptop Pro');
      const mockSearchResult: SearchResult = {
        items: [mockProduct],
        total: 100,
        page: 1,
        limit: 20,
      };

      mockProductSearchPort.search.mockResolvedValue(mockSearchResult);

      const result = await useCase.execute(query);

      expect(mockProductSearchPort.search).toHaveBeenCalledWith(query);
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(100);
    });

    it('should work with price range filter', async () => {
      const query: SearchProductsQueryDto = {
        minPrice: 500,
        maxPrice: 1500,
        page: 1,
        limit: 20,
        sort: 'price_asc',
      };

      const mockProduct = createMockProduct('1', 'Laptop Pro');
      const mockSearchResult: SearchResult = {
        items: [mockProduct],
        total: 25,
        page: 1,
        limit: 20,
      };

      mockProductSearchPort.search.mockResolvedValue(mockSearchResult);

      const result = await useCase.execute(query);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(25);
    });

    it('should work with geolocation filter', async () => {
      const query: SearchProductsQueryDto = {
        lat: 40.7128,
        lon: -74.006,
        radiusKm: 10,
        page: 1,
        limit: 20,
        sort: 'relevance',
      };

      const mockProduct = createMockProduct('1', 'Laptop Pro');
      const mockSearchResult: SearchResult = {
        items: [mockProduct],
        total: 15,
        page: 1,
        limit: 20,
      };

      mockProductSearchPort.search.mockResolvedValue(mockSearchResult);

      const result = await useCase.execute(query);

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(15);
    });

    it('should propagate errors from search port', async () => {
      const query: SearchProductsQueryDto = {
        text: 'laptop',
        page: 1,
        limit: 20,
        sort: 'relevance',
      };

      const error = new Error('Elasticsearch connection failed');
      mockProductSearchPort.search.mockRejectedValue(error);

      await expect(useCase.execute(query)).rejects.toThrow(
        'Elasticsearch connection failed',
      );
    });
  });
});
