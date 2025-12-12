import { Product } from '../../../domain/entities/product.entity';
import { ProductOrmEntity } from './product.orm-entity';
import { TypeOrmProductMapper } from './product.mapper';

describe('TypeOrmProductMapper', () => {
  describe('toDomain', () => {
    it('should map ORM entity to Product domain entity', () => {
      const ormEntity = new ProductOrmEntity();
      ormEntity.id = 'test-id-123';
      ormEntity.name = 'Laptop Pro';
      ormEntity.description = 'High-performance laptop';
      ormEntity.category = 'Electronics';
      ormEntity.subcategories = ['Laptops', 'Computers'];
      ormEntity.price = 1299.99;
      ormEntity.latitude = 40.7128;
      ormEntity.longitude = -74.006;
      ormEntity.popularity = 150;
      ormEntity.createdAt = new Date('2024-01-01T10:00:00Z');
      ormEntity.updatedAt = new Date('2024-01-02T15:30:00Z');

      const product = TypeOrmProductMapper.toDomain(ormEntity);

      expect(product.id).toBe('test-id-123');
      expect(product.name).toBe('Laptop Pro');
      expect(product.description).toBe('High-performance laptop');
      expect(product.category).toBe('Electronics');
      expect(product.subcategories).toEqual(['Laptops', 'Computers']);
      expect(product.price).toBe(1299.99);
      expect(product.latitude).toBe(40.7128);
      expect(product.longitude).toBe(-74.006);
      expect(product.popularity).toBe(150);
      expect(product.createdAt).toEqual(new Date('2024-01-01T10:00:00Z'));
      expect(product.updatedAt).toEqual(new Date('2024-01-02T15:30:00Z'));
    });

    it('should handle null subcategories by defaulting to empty array', () => {
      const ormEntity = new ProductOrmEntity();
      ormEntity.id = 'test-id';
      ormEntity.name = 'Product';
      ormEntity.description = 'Test';
      ormEntity.category = 'Test';
      ormEntity.subcategories = null as any;
      ormEntity.price = 100;
      ormEntity.latitude = 0;
      ormEntity.longitude = 0;
      ormEntity.popularity = 0;
      ormEntity.createdAt = new Date();
      ormEntity.updatedAt = new Date();

      const product = TypeOrmProductMapper.toDomain(ormEntity);

      expect(product.subcategories).toEqual([]);
    });

    it('should handle undefined subcategories by defaulting to empty array', () => {
      const ormEntity = new ProductOrmEntity();
      ormEntity.id = 'test-id';
      ormEntity.name = 'Product';
      ormEntity.description = 'Test';
      ormEntity.category = 'Test';
      ormEntity.subcategories = undefined as any;
      ormEntity.price = 100;
      ormEntity.latitude = 0;
      ormEntity.longitude = 0;
      ormEntity.popularity = 0;
      ormEntity.createdAt = new Date();
      ormEntity.updatedAt = new Date();

      const product = TypeOrmProductMapper.toDomain(ormEntity);

      expect(product.subcategories).toEqual([]);
    });

    it('should preserve Date objects', () => {
      const createdDate = new Date('2024-06-15T10:30:00Z');
      const updatedDate = new Date('2024-06-16T14:45:00Z');

      const ormEntity = new ProductOrmEntity();
      ormEntity.id = 'test-id';
      ormEntity.name = 'Product';
      ormEntity.description = 'Test';
      ormEntity.category = 'Test';
      ormEntity.subcategories = [];
      ormEntity.price = 100;
      ormEntity.latitude = 0;
      ormEntity.longitude = 0;
      ormEntity.popularity = 0;
      ormEntity.createdAt = createdDate;
      ormEntity.updatedAt = updatedDate;

      const product = TypeOrmProductMapper.toDomain(ormEntity);

      expect(product.createdAt).toBe(createdDate);
      expect(product.updatedAt).toBe(updatedDate);
    });
  });

  describe('toDomainMany', () => {
    it('should map array of ORM entities to array of Products', () => {
      const ormEntities: ProductOrmEntity[] = [];

      for (let i = 1; i <= 3; i++) {
        const entity = new ProductOrmEntity();
        entity.id = `id-${i}`;
        entity.name = `Product ${i}`;
        entity.description = `Description ${i}`;
        entity.category = `Category${i}`;
        entity.subcategories = [`Sub${i}`];
        entity.price = i * 100;
        entity.latitude = i;
        entity.longitude = i;
        entity.popularity = i * 10;
        entity.createdAt = new Date(`2024-01-0${i}T00:00:00Z`);
        entity.updatedAt = new Date(`2024-01-0${i}T00:00:00Z`);
        ormEntities.push(entity);
      }

      const products = TypeOrmProductMapper.toDomainMany(ormEntities);

      expect(products).toHaveLength(3);
      expect(products[0].name).toBe('Product 1');
      expect(products[1].name).toBe('Product 2');
      expect(products[2].name).toBe('Product 3');
    });

    it('should return empty array for empty input', () => {
      const products = TypeOrmProductMapper.toDomainMany([]);

      expect(products).toEqual([]);
    });
  });

  describe('toOrmForCreate', () => {
    it('should map Product to ORM entity for creation', () => {
      const product = Product.create({
        name: 'New Laptop',
        description: 'Brand new laptop',
        category: 'Electronics',
        subcategories: ['Laptops'],
        price: 899.99,
        latitude: 40.7128,
        longitude: -74.006,
      });

      const ormEntity = TypeOrmProductMapper.toOrmForCreate(product);

      expect(ormEntity.id).toBe(product.id);
      expect(ormEntity.name).toBe('New Laptop');
      expect(ormEntity.description).toBe('Brand new laptop');
      expect(ormEntity.category).toBe('Electronics');
      expect(ormEntity.subcategories).toEqual(['Laptops']);
      expect(ormEntity.price).toBe(899.99);
      expect(ormEntity.latitude).toBe(40.7128);
      expect(ormEntity.longitude).toBe(-74.006);
      expect(ormEntity.popularity).toBe(0);
    });

    it('should not set createdAt and updatedAt (let database handle it)', () => {
      const product = Product.create({
        name: 'Product',
        description: 'Test',
        category: 'Test',
        subcategories: [],
        price: 100,
        latitude: 0,
        longitude: 0,
      });

      const ormEntity = TypeOrmProductMapper.toOrmForCreate(product);

      expect(ormEntity.createdAt).toBeUndefined();
      expect(ormEntity.updatedAt).toBeUndefined();
    });

    it('should handle empty subcategories', () => {
      const product = Product.create({
        name: 'Product',
        description: 'Test',
        category: 'Test',
        subcategories: [],
        price: 100,
        latitude: 0,
        longitude: 0,
      });

      const ormEntity = TypeOrmProductMapper.toOrmForCreate(product);

      expect(ormEntity.subcategories).toEqual([]);
    });
  });

  describe('toOrmForUpdate', () => {
    it('should update existing ORM entity with Product data', () => {
      const existingOrm = new ProductOrmEntity();
      existingOrm.id = 'existing-id';
      existingOrm.name = 'Old Name';
      existingOrm.description = 'Old Description';
      existingOrm.category = 'Old Category';
      existingOrm.subcategories = ['OldSub'];
      existingOrm.price = 500;
      existingOrm.latitude = 0;
      existingOrm.longitude = 0;
      existingOrm.popularity = 50;
      existingOrm.createdAt = new Date('2024-01-01');
      existingOrm.updatedAt = new Date('2024-01-01');

      const updatedProduct = Product.reconstitute({
        id: 'existing-id',
        name: 'Updated Name',
        description: 'Updated Description',
        category: 'Updated Category',
        subcategories: ['NewSub1', 'NewSub2'],
        price: 1000,
        latitude: 40,
        longitude: -74,
        popularity: 100,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-02-01'),
      });

      const result = TypeOrmProductMapper.toOrmForUpdate(
        updatedProduct,
        existingOrm,
      );

      expect(result).toBe(existingOrm); // Same instance
      expect(result.id).toBe('existing-id');
      expect(result.name).toBe('Updated Name');
      expect(result.description).toBe('Updated Description');
      expect(result.category).toBe('Updated Category');
      expect(result.subcategories).toEqual(['NewSub1', 'NewSub2']);
      expect(result.price).toBe(1000);
      expect(result.latitude).toBe(40);
      expect(result.longitude).toBe(-74);
      expect(result.popularity).toBe(100);
    });

    it('should preserve original createdAt and updatedAt timestamps', () => {
      const originalCreatedAt = new Date('2024-01-01T10:00:00Z');
      const originalUpdatedAt = new Date('2024-01-05T10:00:00Z');

      const existingOrm = new ProductOrmEntity();
      existingOrm.id = 'test-id';
      existingOrm.name = 'Old';
      existingOrm.description = 'Old';
      existingOrm.category = 'Old';
      existingOrm.subcategories = [];
      existingOrm.price = 100;
      existingOrm.latitude = 0;
      existingOrm.longitude = 0;
      existingOrm.popularity = 0;
      existingOrm.createdAt = originalCreatedAt;
      existingOrm.updatedAt = originalUpdatedAt;

      const updatedProduct = Product.reconstitute({
        id: 'test-id',
        name: 'New',
        description: 'New',
        category: 'New',
        subcategories: [],
        price: 200,
        latitude: 1,
        longitude: 1,
        popularity: 10,
        createdAt: new Date('2024-02-01'), // Different date
        updatedAt: new Date('2024-02-02'), // Different date
      });

      const result = TypeOrmProductMapper.toOrmForUpdate(
        updatedProduct,
        existingOrm,
      );

      // Timestamps should remain from existingOrm
      expect(result.createdAt).toBe(originalCreatedAt);
      expect(result.updatedAt).toBe(originalUpdatedAt);
    });

    it('should return the same ORM entity instance', () => {
      const existingOrm = new ProductOrmEntity();
      existingOrm.id = 'test-id';
      existingOrm.name = 'Product';
      existingOrm.description = 'Test';
      existingOrm.category = 'Test';
      existingOrm.subcategories = [];
      existingOrm.price = 100;
      existingOrm.latitude = 0;
      existingOrm.longitude = 0;
      existingOrm.popularity = 0;
      existingOrm.createdAt = new Date();
      existingOrm.updatedAt = new Date();

      const product = Product.reconstitute({
        id: 'test-id',
        name: 'Updated',
        description: 'Updated',
        category: 'Updated',
        subcategories: [],
        price: 200,
        latitude: 0,
        longitude: 0,
        popularity: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = TypeOrmProductMapper.toOrmForUpdate(product, existingOrm);

      expect(result).toBe(existingOrm);
    });

    it('should handle update with empty subcategories', () => {
      const existingOrm = new ProductOrmEntity();
      existingOrm.id = 'test-id';
      existingOrm.name = 'Product';
      existingOrm.description = 'Test';
      existingOrm.category = 'Test';
      existingOrm.subcategories = ['OldSub'];
      existingOrm.price = 100;
      existingOrm.latitude = 0;
      existingOrm.longitude = 0;
      existingOrm.popularity = 0;
      existingOrm.createdAt = new Date();
      existingOrm.updatedAt = new Date();

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

      const result = TypeOrmProductMapper.toOrmForUpdate(product, existingOrm);

      expect(result.subcategories).toEqual([]);
    });
  });

  describe('toOrmForCreate', () => {
    it('should create new ORM entity without timestamps', () => {
      const product = Product.create({
        name: 'New Product',
        description: 'Brand new',
        category: 'Electronics',
        subcategories: ['Laptops'],
        price: 999.99,
        latitude: 40.7128,
        longitude: -74.006,
      });

      const ormEntity = TypeOrmProductMapper.toOrmForCreate(product);

      expect(ormEntity.id).toBe(product.id);
      expect(ormEntity.name).toBe('New Product');
      expect(ormEntity.description).toBe('Brand new');
      expect(ormEntity.category).toBe('Electronics');
      expect(ormEntity.subcategories).toEqual(['Laptops']);
      expect(ormEntity.price).toBe(999.99);
      expect(ormEntity.latitude).toBe(40.7128);
      expect(ormEntity.longitude).toBe(-74.006);
      expect(ormEntity.popularity).toBe(0);
      expect(ormEntity.createdAt).toBeUndefined();
      expect(ormEntity.updatedAt).toBeUndefined();
    });

    it('should create new instance of ProductOrmEntity', () => {
      const product = Product.create({
        name: 'Product',
        description: 'Test',
        category: 'Test',
        subcategories: [],
        price: 100,
        latitude: 0,
        longitude: 0,
      });

      const ormEntity = TypeOrmProductMapper.toOrmForCreate(product);

      expect(ormEntity).toBeInstanceOf(ProductOrmEntity);
    });

    it('should handle product with multiple subcategories', () => {
      const product = Product.create({
        name: 'Product',
        description: 'Test',
        category: 'Test',
        subcategories: ['Sub1', 'Sub2', 'Sub3', 'Sub4'],
        price: 100,
        latitude: 0,
        longitude: 0,
      });

      const ormEntity = TypeOrmProductMapper.toOrmForCreate(product);

      expect(ormEntity.subcategories).toEqual(['Sub1', 'Sub2', 'Sub3', 'Sub4']);
    });
  });

  describe('toDomainMany', () => {
    it('should map array of ORM entities to array of Products', () => {
      const ormEntities: ProductOrmEntity[] = [];

      for (let i = 1; i <= 3; i++) {
        const entity = new ProductOrmEntity();
        entity.id = `id-${i}`;
        entity.name = `Product ${i}`;
        entity.description = `Description ${i}`;
        entity.category = `Category${i}`;
        entity.subcategories = [`Sub${i}`];
        entity.price = i * 100;
        entity.latitude = i;
        entity.longitude = i;
        entity.popularity = i * 10;
        entity.createdAt = new Date(`2024-01-0${i}T00:00:00Z`);
        entity.updatedAt = new Date(`2024-01-0${i}T00:00:00Z`);
        ormEntities.push(entity);
      }

      const products = TypeOrmProductMapper.toDomainMany(ormEntities);

      expect(products).toHaveLength(3);
      expect(products[0].id).toBe('id-1');
      expect(products[0].name).toBe('Product 1');
      expect(products[1].id).toBe('id-2');
      expect(products[1].name).toBe('Product 2');
      expect(products[2].id).toBe('id-3');
      expect(products[2].name).toBe('Product 3');
    });

    it('should return empty array for empty input', () => {
      const products = TypeOrmProductMapper.toDomainMany([]);

      expect(products).toEqual([]);
    });

    it('should handle single entity array', () => {
      const entity = new ProductOrmEntity();
      entity.id = 'single-id';
      entity.name = 'Single Product';
      entity.description = 'Only one';
      entity.category = 'Test';
      entity.subcategories = [];
      entity.price = 100;
      entity.latitude = 0;
      entity.longitude = 0;
      entity.popularity = 0;
      entity.createdAt = new Date();
      entity.updatedAt = new Date();

      const products = TypeOrmProductMapper.toDomainMany([entity]);

      expect(products).toHaveLength(1);
      expect(products[0].id).toBe('single-id');
    });
  });

  describe('bidirectional mapping', () => {
    it('should maintain data integrity when mapping to ORM and back to domain', () => {
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

      const ormEntity = TypeOrmProductMapper.toOrmForCreate(originalProduct);
      // Simulate database setting timestamps
      ormEntity.createdAt = originalProduct.createdAt;
      ormEntity.updatedAt = originalProduct.updatedAt;

      const reconstructedProduct = TypeOrmProductMapper.toDomain(ormEntity);

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
    });
  });
});

