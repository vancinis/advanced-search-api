import { Test, TestingModule } from '@nestjs/testing';
import { Product } from '../../domain/entities/product.entity';
import { ProductNotFoundException } from '../../domain/exceptions/product.exception';
import {
  PRODUCT_SEARCH_PORT,
  ProductSearchPort,
} from '../../domain/ports/product-search.port';
import { FindProductByIdUseCase } from './find-product-by-id.usecase';

describe('FindProductByIdUseCase', () => {
  let useCase: FindProductByIdUseCase;
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
        FindProductByIdUseCase,
        {
          provide: PRODUCT_SEARCH_PORT,
          useValue: mockProductSearchPort,
        },
      ],
    }).compile();

    useCase = module.get<FindProductByIdUseCase>(FindProductByIdUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockProduct = (): Product => {
    return Product.reconstitute({
      id: 'test-id-123',
      name: 'Laptop Pro',
      description: 'High-performance laptop',
      category: 'Electronics',
      subcategories: ['Laptops', 'Computers'],
      price: 1299.99,
      latitude: 40.7128,
      longitude: -74.006,
      popularity: 150,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    });
  };

  describe('execute', () => {
    it('should return product DTO when product is found', async () => {
      const mockProduct = createMockProduct();
      mockProductSearchPort.findById.mockResolvedValue(mockProduct);

      const result = await useCase.execute('test-id-123');

      expect(mockProductSearchPort.findById).toHaveBeenCalledWith(
        'test-id-123',
      );
      expect(mockProductSearchPort.findById).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
      expect(result.id).toBe('test-id-123');
      expect(result.name).toBe('Laptop Pro');
      expect(result.description).toBe('High-performance laptop');
      expect(result.category).toBe('Electronics');
      expect(result.subcategories).toEqual(['Laptops', 'Computers']);
      expect(result.price).toBe(1299.99);
      expect(result.latitude).toBe(40.7128);
      expect(result.longitude).toBe(-74.006);
      expect(result.popularity).toBe(150);
    });

    it('should throw ProductNotFoundException when product is not found', async () => {
      mockProductSearchPort.findById.mockResolvedValue(null);

      await expect(useCase.execute('nonexistent-id')).rejects.toThrow(
        ProductNotFoundException,
      );
      await expect(useCase.execute('nonexistent-id')).rejects.toThrow(
        'Product with id "nonexistent-id" not found',
      );
    });

    it('should call findById with correct ID', async () => {
      const mockProduct = createMockProduct();
      mockProductSearchPort.findById.mockResolvedValue(mockProduct);

      await useCase.execute('specific-id-456');

      expect(mockProductSearchPort.findById).toHaveBeenCalledWith(
        'specific-id-456',
      );
    });

    it('should map all product properties to DTO correctly', async () => {
      const specificDate = new Date('2024-06-15T10:30:00Z');
      const product = Product.reconstitute({
        id: 'product-789',
        name: 'Gaming Laptop',
        description: 'Ultimate gaming machine',
        category: 'Gaming',
        subcategories: ['Laptops', 'Gaming', 'High-End'],
        price: 2499.99,
        latitude: 34.0522,
        longitude: -118.2437,
        popularity: 500,
        createdAt: specificDate,
        updatedAt: specificDate,
      });

      mockProductSearchPort.findById.mockResolvedValue(product);

      const result = await useCase.execute('product-789');

      expect(result.id).toBe('product-789');
      expect(result.name).toBe('Gaming Laptop');
      expect(result.description).toBe('Ultimate gaming machine');
      expect(result.category).toBe('Gaming');
      expect(result.subcategories).toEqual(['Laptops', 'Gaming', 'High-End']);
      expect(result.price).toBe(2499.99);
      expect(result.latitude).toBe(34.0522);
      expect(result.longitude).toBe(-118.2437);
      expect(result.popularity).toBe(500);
      expect(result.createdAt).toEqual(specificDate);
      expect(result.updatedAt).toEqual(specificDate);
    });

    it('should propagate errors from search port', async () => {
      const error = new Error('Elasticsearch connection failed');
      mockProductSearchPort.findById.mockRejectedValue(error);

      await expect(useCase.execute('test-id')).rejects.toThrow(
        'Elasticsearch connection failed',
      );
    });

    it('should handle UUID format IDs', async () => {
      const uuidId = '550e8400-e29b-41d4-a716-446655440000';
      const mockProduct = createMockProduct();
      mockProductSearchPort.findById.mockResolvedValue(mockProduct);

      await useCase.execute(uuidId);

      expect(mockProductSearchPort.findById).toHaveBeenCalledWith(uuidId);
    });

    it('should handle empty subcategories array', async () => {
      const product = Product.reconstitute({
        id: 'test-id',
        name: 'Simple Product',
        description: 'Test',
        category: 'General',
        subcategories: [],
        price: 99.99,
        latitude: 0,
        longitude: 0,
        popularity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockProductSearchPort.findById.mockResolvedValue(product);

      const result = await useCase.execute('test-id');

      expect(result.subcategories).toEqual([]);
    });

    it('should preserve exact price values including decimals', async () => {
      const product = Product.reconstitute({
        id: 'test-id',
        name: 'Product',
        description: 'Test',
        category: 'Test',
        subcategories: [],
        price: 1234.56,
        latitude: 0,
        longitude: 0,
        popularity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockProductSearchPort.findById.mockResolvedValue(product);

      const result = await useCase.execute('test-id');

      expect(result.price).toBe(1234.56);
    });

    it('should handle products with zero popularity', async () => {
      const product = Product.reconstitute({
        id: 'test-id',
        name: 'New Product',
        description: 'Just launched',
        category: 'Test',
        subcategories: [],
        price: 99.99,
        latitude: 0,
        longitude: 0,
        popularity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockProductSearchPort.findById.mockResolvedValue(product);

      const result = await useCase.execute('test-id');

      expect(result.popularity).toBe(0);
    });

    it('should not call findById multiple times for single execution', async () => {
      const mockProduct = createMockProduct();
      mockProductSearchPort.findById.mockResolvedValue(mockProduct);

      await useCase.execute('test-id');

      expect(mockProductSearchPort.findById).toHaveBeenCalledTimes(1);
    });
  });
});

