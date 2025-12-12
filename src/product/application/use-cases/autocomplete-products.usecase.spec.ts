import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_PORT, CachePort } from '../../domain/ports/cache.port';
import {
  PRODUCT_SEARCH_PORT,
  ProductSearchPort,
} from '../../domain/ports/product-search.port';
import { AutocompleteQueryDto } from '../dtos/autocomplete.query.dto';
import { AutocompleteResponseDto } from '../dtos/autocomplete.response.dto';
import { AutocompleteProductsUseCase } from './autocomplete-products.usecase';

describe('AutocompleteProductsUseCase', () => {
  let useCase: AutocompleteProductsUseCase;
  let mockProductSearchPort: jest.Mocked<ProductSearchPort>;
  let mockCachePort: jest.Mocked<CachePort>;

  beforeEach(async () => {
    mockProductSearchPort = {
      search: jest.fn(),
      findById: jest.fn(),
      autocomplete: jest.fn(),
      index: jest.fn(),
      checkConnection: jest.fn(),
    };

    mockCachePort = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      clear: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutocompleteProductsUseCase,
        {
          provide: PRODUCT_SEARCH_PORT,
          useValue: mockProductSearchPort,
        },
        {
          provide: CACHE_PORT,
          useValue: mockCachePort,
        },
      ],
    }).compile();

    useCase = module.get<AutocompleteProductsUseCase>(
      AutocompleteProductsUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should return cached result when cache hit', async () => {
      const query: AutocompleteQueryDto = {
        text: 'laptop',
        limit: 5,
      };

      const cachedResult: AutocompleteResponseDto = {
        suggestions: ['Laptop Pro', 'Gaming Laptop', 'Business Laptop'],
      };

      mockCachePort.get.mockResolvedValue(cachedResult);

      const result = await useCase.execute(query);

      expect(mockCachePort.get).toHaveBeenCalledWith('autocomplete:laptop:5');
      expect(mockProductSearchPort.autocomplete).not.toHaveBeenCalled();
      expect(mockCachePort.set).not.toHaveBeenCalled();
      expect(result).toEqual(cachedResult);
    });

    it('should call Elasticsearch and cache result when cache miss', async () => {
      const query: AutocompleteQueryDto = {
        text: 'laptop',
        limit: 5,
      };

      const elasticsearchResult: AutocompleteResponseDto = {
        suggestions: ['Laptop Pro', 'Gaming Laptop', 'Business Laptop'],
      };

      mockCachePort.get.mockResolvedValue(null);
      mockProductSearchPort.autocomplete.mockResolvedValue(elasticsearchResult);

      const result = await useCase.execute(query);

      expect(mockCachePort.get).toHaveBeenCalledWith('autocomplete:laptop:5');
      expect(mockProductSearchPort.autocomplete).toHaveBeenCalledWith({
        text: 'laptop',
        limit: 5,
      });
      expect(mockCachePort.set).toHaveBeenCalledWith(
        'autocomplete:laptop:5',
        elasticsearchResult,
        300,
      );
      expect(result).toEqual(elasticsearchResult);
    });

    it('should normalize text to lowercase', async () => {
      const query: AutocompleteQueryDto = {
        text: 'LAPTOP',
        limit: 5,
      };

      mockCachePort.get.mockResolvedValue(null);
      mockProductSearchPort.autocomplete.mockResolvedValue({
        suggestions: ['Laptop Pro'],
      });

      await useCase.execute(query);

      expect(mockCachePort.get).toHaveBeenCalledWith('autocomplete:laptop:5');
      expect(mockProductSearchPort.autocomplete).toHaveBeenCalledWith({
        text: 'laptop',
        limit: 5,
      });
    });

    it('should trim whitespace from text', async () => {
      const query: AutocompleteQueryDto = {
        text: '  laptop  ',
        limit: 5,
      };

      mockCachePort.get.mockResolvedValue(null);
      mockProductSearchPort.autocomplete.mockResolvedValue({
        suggestions: ['Laptop Pro'],
      });

      await useCase.execute(query);

      expect(mockCachePort.get).toHaveBeenCalledWith('autocomplete:laptop:5');
      expect(mockProductSearchPort.autocomplete).toHaveBeenCalledWith({
        text: 'laptop',
        limit: 5,
      });
    });

    it('should use default limit of 5 when not provided', async () => {
      const query: AutocompleteQueryDto = {
        text: 'laptop',
        limit: 5,
      };

      mockCachePort.get.mockResolvedValue(null);
      mockProductSearchPort.autocomplete.mockResolvedValue({
        suggestions: ['Laptop Pro'],
      });

      await useCase.execute(query);

      expect(mockCachePort.get).toHaveBeenCalledWith('autocomplete:laptop:5');
      expect(mockProductSearchPort.autocomplete).toHaveBeenCalledWith({
        text: 'laptop',
        limit: 5,
      });
    });

    it('should use custom limit when provided', async () => {
      const query: AutocompleteQueryDto = {
        text: 'laptop',
        limit: 10,
      };

      mockCachePort.get.mockResolvedValue(null);
      mockProductSearchPort.autocomplete.mockResolvedValue({
        suggestions: ['Laptop Pro'],
      });

      await useCase.execute(query);

      expect(mockCachePort.get).toHaveBeenCalledWith('autocomplete:laptop:10');
      expect(mockProductSearchPort.autocomplete).toHaveBeenCalledWith({
        text: 'laptop',
        limit: 10,
      });
    });

    it('should propagate Redis errors when cache fails', async () => {
      const query: AutocompleteQueryDto = {
        text: 'laptop',
        limit: 5,
      };

      mockCachePort.get.mockRejectedValue(new Error('Redis connection failed'));

      await expect(useCase.execute(query)).rejects.toThrow(
        'Redis connection failed',
      );
    });

    it('should cache with TTL of 300 seconds (5 minutes)', async () => {
      const query: AutocompleteQueryDto = {
        text: 'laptop',
        limit: 5,
      };

      const elasticsearchResult: AutocompleteResponseDto = {
        suggestions: ['Laptop Pro'],
      };

      mockCachePort.get.mockResolvedValue(null);
      mockProductSearchPort.autocomplete.mockResolvedValue(elasticsearchResult);

      await useCase.execute(query);

      expect(mockCachePort.set).toHaveBeenCalledWith(
        'autocomplete:laptop:5',
        elasticsearchResult,
        300,
      );
    });

    it('should handle empty suggestions', async () => {
      const query: AutocompleteQueryDto = {
        text: 'nonexistent',
        limit: 5,
      };

      const elasticsearchResult: AutocompleteResponseDto = {
        suggestions: [],
      };

      mockCachePort.get.mockResolvedValue(null);
      mockProductSearchPort.autocomplete.mockResolvedValue(elasticsearchResult);

      const result = await useCase.execute(query);

      expect(result.suggestions).toHaveLength(0);
      expect(mockCachePort.set).toHaveBeenCalled();
    });

    it('should create unique cache keys for different queries', async () => {
      mockCachePort.get.mockResolvedValue(null);
      mockProductSearchPort.autocomplete.mockResolvedValue({
        suggestions: [],
      });

      await useCase.execute({ text: 'laptop', limit: 5 });
      await useCase.execute({ text: 'phone', limit: 5 });
      await useCase.execute({ text: 'laptop', limit: 10 });

      expect(mockCachePort.get).toHaveBeenNthCalledWith(
        1,
        'autocomplete:laptop:5',
      );
      expect(mockCachePort.get).toHaveBeenNthCalledWith(
        2,
        'autocomplete:phone:5',
      );
      expect(mockCachePort.get).toHaveBeenNthCalledWith(
        3,
        'autocomplete:laptop:10',
      );
    });

    it('should normalize text before creating cache key', async () => {
      const query: AutocompleteQueryDto = {
        text: '  LAPTOP  ',
        limit: 5,
      };

      mockCachePort.get.mockResolvedValue(null);
      mockProductSearchPort.autocomplete.mockResolvedValue({
        suggestions: [],
      });

      await useCase.execute(query);

      // Should use normalized text in cache key
      expect(mockCachePort.get).toHaveBeenCalledWith('autocomplete:laptop:5');
      expect(mockCachePort.set).toHaveBeenCalledWith(
        'autocomplete:laptop:5',
        expect.any(Object),
        300,
      );
    });

    it('should propagate Elasticsearch errors', async () => {
      const query: AutocompleteQueryDto = {
        text: 'laptop',
        limit: 5,
      };

      mockCachePort.get.mockResolvedValue(null);
      mockProductSearchPort.autocomplete.mockRejectedValue(
        new Error('Elasticsearch error'),
      );

      await expect(useCase.execute(query)).rejects.toThrow(
        'Elasticsearch error',
      );
    });

    it('should handle special characters in text', async () => {
      const query: AutocompleteQueryDto = {
        text: 'laptop-pro',
        limit: 5,
      };

      mockCachePort.get.mockResolvedValue(null);
      mockProductSearchPort.autocomplete.mockResolvedValue({
        suggestions: ['Laptop-Pro'],
      });

      await useCase.execute(query);

      expect(mockCachePort.get).toHaveBeenCalledWith(
        'autocomplete:laptop-pro:5',
      );
    });
  });
});

