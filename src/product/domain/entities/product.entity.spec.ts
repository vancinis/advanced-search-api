import { InvalidProductException } from '../exceptions/product.exception';
import { Product } from './product.entity';

describe('Product Entity', () => {
  describe('create', () => {
    it('should create a valid product with all fields', () => {
      const props = {
        name: 'Laptop',
        description: 'High-performance laptop',
        category: 'Electronics',
        subcategories: ['Laptops', 'Computers'],
        price: 999.99,
        latitude: 40.7128,
        longitude: -74.006,
      };

      const product = Product.create(props);

      expect(product.name).toBe('Laptop');
      expect(product.description).toBe('High-performance laptop');
      expect(product.category).toBe('Electronics');
      expect(product.subcategories).toEqual(['Laptops', 'Computers']);
      expect(product.price).toBe(999.99);
      expect(product.latitude).toBe(40.7128);
      expect(product.longitude).toBe(-74.006);
      expect(product.popularity).toBe(0);
      expect(product.id).toBeDefined();
      expect(product.createdAt).toBeInstanceOf(Date);
      expect(product.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw error when name is missing', () => {
      const props = {
        name: '',
        description: 'Test',
        category: 'Electronics',
        subcategories: [],
        price: 100,
        latitude: 0,
        longitude: 0,
      };

      expect(() => Product.create(props)).toThrow(InvalidProductException);
      expect(() => Product.create(props)).toThrow('Product name is required');
    });

    it('should throw error when category is missing', () => {
      const props = {
        name: 'Test Product',
        description: 'Test',
        category: '',
        subcategories: [],
        price: 100,
        latitude: 0,
        longitude: 0,
      };

      expect(() => Product.create(props)).toThrow(InvalidProductException);
      expect(() => Product.create(props)).toThrow(
        'Product category is required',
      );
    });

    it('should normalize strings by trimming whitespace', () => {
      const props = {
        name: '  Laptop  ',
        description: 'Test',
        category: '  Electronics  ',
        subcategories: ['  Laptops  ', '  Computers  '],
        price: 100,
        latitude: 0,
        longitude: 0,
      };

      const product = Product.create(props);

      expect(product.name).toBe('Laptop');
      expect(product.category).toBe('Electronics');
      expect(product.subcategories).toEqual(['Laptops', 'Computers']);
    });

    it('should filter out empty subcategories', () => {
      const props = {
        name: 'Laptop',
        description: 'Test',
        category: 'Electronics',
        subcategories: ['Laptops', '', '  ', 'Computers', ''],
        price: 100,
        latitude: 0,
        longitude: 0,
      };

      const product = Product.create(props);

      expect(product.subcategories).toEqual(['Laptops', 'Computers']);
    });

    it('should handle undefined subcategories', () => {
      const props = {
        name: 'Laptop',
        description: 'Test',
        category: 'Electronics',
        subcategories: undefined as any,
        price: 100,
        latitude: 0,
        longitude: 0,
      };

      const product = Product.create(props);

      expect(product.subcategories).toEqual([]);
    });

    it('should reject name with only whitespace', () => {
      const props = {
        name: '   ',
        description: 'Test',
        category: 'Electronics',
        subcategories: [],
        price: 100,
        latitude: 0,
        longitude: 0,
      };

      expect(() => Product.create(props)).toThrow(InvalidProductException);
    });

    it('should reject category with only whitespace', () => {
      const props = {
        name: 'Laptop',
        description: 'Test',
        category: '   ',
        subcategories: [],
        price: 100,
        latitude: 0,
        longitude: 0,
      };

      expect(() => Product.create(props)).toThrow(InvalidProductException);
    });

    it('should initialize popularity to 0', () => {
      const props = {
        name: 'Laptop',
        description: 'Test',
        category: 'Electronics',
        subcategories: [],
        price: 100,
        latitude: 0,
        longitude: 0,
      };

      const product = Product.create(props);

      expect(product.popularity).toBe(0);
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute product from persisted data', () => {
      const now = new Date();
      const props = {
        id: 'test-id-123',
        name: 'Laptop',
        description: 'Test laptop',
        category: 'Electronics',
        subcategories: ['Laptops'],
        price: 999,
        latitude: 40,
        longitude: -74,
        popularity: 150,
        createdAt: now,
        updatedAt: now,
      };

      const product = Product.reconstitute(props);

      expect(product.id).toBe('test-id-123');
      expect(product.name).toBe('Laptop');
      expect(product.category).toBe('Electronics');
      expect(product.popularity).toBe(150);
      expect(product.createdAt).toBe(now);
      expect(product.updatedAt).toBe(now);
    });

    it('should normalize strings during reconstitution', () => {
      const props = {
        id: 'test-id',
        name: '  Laptop  ',
        description: 'Test',
        category: '  Electronics  ',
        subcategories: ['  Laptops  '],
        price: 100,
        latitude: 0,
        longitude: 0,
        popularity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const product = Product.reconstitute(props);

      expect(product.name).toBe('Laptop');
      expect(product.category).toBe('Electronics');
      expect(product.subcategories).toEqual(['Laptops']);
    });

    it('should throw error when reconstituting invalid product', () => {
      const props = {
        id: 'test-id',
        name: '',
        description: 'Test',
        category: 'Electronics',
        subcategories: [],
        price: 100,
        latitude: 0,
        longitude: 0,
        popularity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => Product.reconstitute(props)).toThrow(
        InvalidProductException,
      );
    });

    it('should default popularity to 0 if undefined', () => {
      const props = {
        id: 'test-id',
        name: 'Laptop',
        description: 'Test',
        category: 'Electronics',
        subcategories: [],
        price: 100,
        latitude: 0,
        longitude: 0,
        popularity: undefined as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const product = Product.reconstitute(props);

      expect(product.popularity).toBe(0);
    });
  });

  describe('getters', () => {
    it('should return defensive copy of subcategories', () => {
      const product = Product.create({
        name: 'Laptop',
        description: 'Test',
        category: 'Electronics',
        subcategories: ['Laptops', 'Computers'],
        price: 100,
        latitude: 0,
        longitude: 0,
      });

      const subcategories1 = product.subcategories;
      const subcategories2 = product.subcategories;

      expect(subcategories1).toEqual(subcategories2);
      expect(subcategories1).not.toBe(subcategories2); // Different array instances
    });
  });

  describe('toPrimitives', () => {
    it('should return all properties as primitives', () => {
      const product = Product.create({
        name: 'Laptop',
        description: 'Test laptop',
        category: 'Electronics',
        subcategories: ['Laptops', 'Computers'],
        price: 999.99,
        latitude: 40.7128,
        longitude: -74.006,
      });

      const primitives = product.toPrimitives();

      expect(primitives.id).toBeDefined();
      expect(primitives.name).toBe('Laptop');
      expect(primitives.description).toBe('Test laptop');
      expect(primitives.category).toBe('Electronics');
      expect(primitives.subcategories).toEqual(['Laptops', 'Computers']);
      expect(primitives.price).toBe(999.99);
      expect(primitives.latitude).toBe(40.7128);
      expect(primitives.longitude).toBe(-74.006);
      expect(primitives.popularity).toBe(0);
      expect(primitives.createdAt).toBeInstanceOf(Date);
      expect(primitives.updatedAt).toBeInstanceOf(Date);
    });

    it('should return defensive copy of subcategories in primitives', () => {
      const product = Product.create({
        name: 'Laptop',
        description: 'Test',
        category: 'Electronics',
        subcategories: ['Laptops'],
        price: 100,
        latitude: 0,
        longitude: 0,
      });

      const primitives = product.toPrimitives();
      primitives.subcategories.push('Modified');

      expect(product.subcategories).toEqual(['Laptops']);
    });
  });
});
