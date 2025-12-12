import { Product } from '../../../domain/entities/product.entity';
import { ProductDocument } from './product.document';
import { ElasticsearchProductMapper } from './product.mapper';

describe('ElasticsearchProductMapper', () => {
  describe('toDocument', () => {
    it('should map Product entity to Elasticsearch document', () => {
      const product = Product.reconstitute({
        id: 'test-id-123',
        name: 'Laptop Pro',
        description: 'High-performance laptop',
        category: 'Electronics',
        subcategories: ['Laptops', 'Computers'],
        price: 1299.99,
        latitude: 40.7128,
        longitude: -74.006,
        popularity: 150,
        createdAt: new Date('2024-01-01T10:00:00Z'),
        updatedAt: new Date('2024-01-02T15:30:00Z'),
      });

      const document = ElasticsearchProductMapper.toDocument(product);

      expect(document.id).toBe('test-id-123');
      expect(document.name).toBe('Laptop Pro');
      expect(document.description).toBe('High-performance laptop');
      expect(document.category).toBe('Electronics');
      expect(document.subcategories).toEqual(['Laptops', 'Computers']);
      expect(document.price).toBe(1299.99);
      expect(document.location.lat).toBe(40.7128);
      expect(document.location.lon).toBe(-74.006);
      expect(document.popularity).toBe(150);
      expect(document.createdAt).toBe('2024-01-01T10:00:00.000Z');
      expect(document.updatedAt).toBe('2024-01-02T15:30:00.000Z');
    });

    it('should convert dates to ISO strings', () => {
      const specificDate = new Date('2024-06-15T14:30:45.123Z');
      const product = Product.reconstitute({
        id: 'test-id',
        name: 'Product',
        description: 'Test',
        category: 'Test',
        subcategories: [],
        price: 100,
        latitude: 0,
        longitude: 0,
        popularity: 0,
        createdAt: specificDate,
        updatedAt: specificDate,
      });

      const document = ElasticsearchProductMapper.toDocument(product);

      expect(document.createdAt).toBe('2024-06-15T14:30:45.123Z');
      expect(document.updatedAt).toBe('2024-06-15T14:30:45.123Z');
      expect(typeof document.createdAt).toBe('string');
      expect(typeof document.updatedAt).toBe('string');
    });

    it('should map location to nested object with lat/lon', () => {
      const product = Product.reconstitute({
        id: 'test-id',
        name: 'Product',
        description: 'Test',
        category: 'Test',
        subcategories: [],
        price: 100,
        latitude: 34.0522,
        longitude: -118.2437,
        popularity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const document = ElasticsearchProductMapper.toDocument(product);

      expect(document.location).toEqual({
        lat: 34.0522,
        lon: -118.2437,
      });
    });

    it('should handle empty subcategories array', () => {
      const product = Product.reconstitute({
        id: 'test-id',
        name: 'Product',
        description: 'Test',
        category: 'Test',
        subcategories: [],
        price: 100,
        latitude: 0,
        longitude: 0,
        popularity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const document = ElasticsearchProductMapper.toDocument(product);

      expect(document.subcategories).toEqual([]);
    });

    it('should preserve exact price values', () => {
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

      const document = ElasticsearchProductMapper.toDocument(product);

      expect(document.price).toBe(1234.56);
    });

    it('should preserve zero popularity', () => {
      const product = Product.reconstitute({
        id: 'test-id',
        name: 'Product',
        description: 'Test',
        category: 'Test',
        subcategories: [],
        price: 100,
        latitude: 0,
        longitude: 0,
        popularity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const document = ElasticsearchProductMapper.toDocument(product);

      expect(document.popularity).toBe(0);
    });
  });

  describe('toDomain', () => {
    it('should map Elasticsearch document to Product entity', () => {
      const document: ProductDocument = {
        id: 'test-id-456',
        name: 'Gaming Laptop',
        description: 'Ultimate gaming machine',
        category: 'Gaming',
        subcategories: ['Laptops', 'Gaming', 'High-End'],
        price: 2499.99,
        location: {
          lat: 34.0522,
          lon: -118.2437,
        },
        popularity: 500,
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-02T15:30:00.000Z',
      };

      const product = ElasticsearchProductMapper.toDomain(document);

      expect(product.id).toBe('test-id-456');
      expect(product.name).toBe('Gaming Laptop');
      expect(product.description).toBe('Ultimate gaming machine');
      expect(product.category).toBe('Gaming');
      expect(product.subcategories).toEqual(['Laptops', 'Gaming', 'High-End']);
      expect(product.price).toBe(2499.99);
      expect(product.latitude).toBe(34.0522);
      expect(product.longitude).toBe(-118.2437);
      expect(product.popularity).toBe(500);
      expect(product.createdAt).toEqual(new Date('2024-01-01T10:00:00.000Z'));
      expect(product.updatedAt).toEqual(new Date('2024-01-02T15:30:00.000Z'));
    });

    it('should convert ISO string dates to Date objects', () => {
      const document: ProductDocument = {
        id: 'test-id',
        name: 'Product',
        description: 'Test',
        category: 'Test',
        subcategories: [],
        price: 100,
        location: { lat: 0, lon: 0 },
        popularity: 0,
        createdAt: '2024-06-15T14:30:45.123Z',
        updatedAt: '2024-06-15T14:30:45.123Z',
      };

      const product = ElasticsearchProductMapper.toDomain(document);

      expect(product.createdAt).toBeInstanceOf(Date);
      expect(product.updatedAt).toBeInstanceOf(Date);
      expect(product.createdAt.toISOString()).toBe(
        '2024-06-15T14:30:45.123Z',
      );
      expect(product.updatedAt.toISOString()).toBe(
        '2024-06-15T14:30:45.123Z',
      );
    });

    it('should extract lat/lon from nested location object', () => {
      const document: ProductDocument = {
        id: 'test-id',
        name: 'Product',
        description: 'Test',
        category: 'Test',
        subcategories: [],
        price: 100,
        location: {
          lat: 40.7128,
          lon: -74.006,
        },
        popularity: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const product = ElasticsearchProductMapper.toDomain(document);

      expect(product.latitude).toBe(40.7128);
      expect(product.longitude).toBe(-74.006);
    });

    it('should handle empty subcategories array', () => {
      const document: ProductDocument = {
        id: 'test-id',
        name: 'Product',
        description: 'Test',
        category: 'Test',
        subcategories: [],
        price: 100,
        location: { lat: 0, lon: 0 },
        popularity: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const product = ElasticsearchProductMapper.toDomain(document);

      expect(product.subcategories).toEqual([]);
    });

    it('should preserve exact numeric values', () => {
      const document: ProductDocument = {
        id: 'test-id',
        name: 'Product',
        description: 'Test',
        category: 'Test',
        subcategories: [],
        price: 1234.56,
        location: { lat: 12.3456, lon: -98.7654 },
        popularity: 789,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const product = ElasticsearchProductMapper.toDomain(document);

      expect(product.price).toBe(1234.56);
      expect(product.latitude).toBe(12.3456);
      expect(product.longitude).toBe(-98.7654);
      expect(product.popularity).toBe(789);
    });
  });

  describe('toDomainMany', () => {
    it('should map array of documents to array of products', () => {
      const documents: ProductDocument[] = [
        {
          id: 'id-1',
          name: 'Product 1',
          description: 'First product',
          category: 'Category1',
          subcategories: ['Sub1'],
          price: 100,
          location: { lat: 0, lon: 0 },
          popularity: 10,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: 'id-2',
          name: 'Product 2',
          description: 'Second product',
          category: 'Category2',
          subcategories: ['Sub2'],
          price: 200,
          location: { lat: 1, lon: 1 },
          popularity: 20,
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        },
        {
          id: 'id-3',
          name: 'Product 3',
          description: 'Third product',
          category: 'Category3',
          subcategories: ['Sub3'],
          price: 300,
          location: { lat: 2, lon: 2 },
          popularity: 30,
          createdAt: '2024-01-03T00:00:00.000Z',
          updatedAt: '2024-01-03T00:00:00.000Z',
        },
      ];

      const products = ElasticsearchProductMapper.toDomainMany(documents);

      expect(products).toHaveLength(3);
      expect(products[0].id).toBe('id-1');
      expect(products[0].name).toBe('Product 1');
      expect(products[1].id).toBe('id-2');
      expect(products[1].name).toBe('Product 2');
      expect(products[2].id).toBe('id-3');
      expect(products[2].name).toBe('Product 3');
    });

    it('should return empty array for empty input', () => {
      const products = ElasticsearchProductMapper.toDomainMany([]);

      expect(products).toEqual([]);
    });

    it('should handle single document array', () => {
      const documents: ProductDocument[] = [
        {
          id: 'single-id',
          name: 'Single Product',
          description: 'Only one',
          category: 'Test',
          subcategories: [],
          price: 100,
          location: { lat: 0, lon: 0 },
          popularity: 0,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      ];

      const products = ElasticsearchProductMapper.toDomainMany(documents);

      expect(products).toHaveLength(1);
      expect(products[0].id).toBe('single-id');
    });
  });

  describe('bidirectional mapping', () => {
    it('should maintain data integrity when mapping to document and back to domain', () => {
      const originalProduct = Product.reconstitute({
        id: 'test-id-789',
        name: 'Test Product',
        description: 'Test Description',
        category: 'Test Category',
        subcategories: ['Sub1', 'Sub2', 'Sub3'],
        price: 999.99,
        latitude: 40.7128,
        longitude: -74.006,
        popularity: 250,
        createdAt: new Date('2024-01-15T10:30:00.000Z'),
        updatedAt: new Date('2024-01-16T14:45:00.000Z'),
      });

      const document = ElasticsearchProductMapper.toDocument(originalProduct);
      const reconstructedProduct =
        ElasticsearchProductMapper.toDomain(document);

      expect(reconstructedProduct.id).toBe(originalProduct.id);
      expect(reconstructedProduct.name).toBe(originalProduct.name);
      expect(reconstructedProduct.description).toBe(
        originalProduct.description,
      );
      expect(reconstructedProduct.category).toBe(originalProduct.category);
      expect(reconstructedProduct.subcategories).toEqual(
        originalProduct.subcategories,
      );
      expect(reconstructedProduct.price).toBe(originalProduct.price);
      expect(reconstructedProduct.latitude).toBe(originalProduct.latitude);
      expect(reconstructedProduct.longitude).toBe(originalProduct.longitude);
      expect(reconstructedProduct.popularity).toBe(originalProduct.popularity);
      expect(reconstructedProduct.createdAt.toISOString()).toBe(
        originalProduct.createdAt.toISOString(),
      );
      expect(reconstructedProduct.updatedAt.toISOString()).toBe(
        originalProduct.updatedAt.toISOString(),
      );
    });
  });
});

