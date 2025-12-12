import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ProductSortOptions } from '../../domain/contracts/sort-options';
import { SearchProductsQueryDto } from './search-products.query.dto';

describe('SearchProductsQueryDto', () => {
  describe('text validation', () => {
    it('should accept valid text up to 500 characters', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        text: 'a'.repeat(500),
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should reject text exceeding 500 characters', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        text: 'a'.repeat(501),
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const textError = errors.find((e) => e.property === 'text');
      expect(textError).toBeDefined();
      expect(textError?.constraints?.maxLength).toContain('500 characters');
    });

    it('should accept empty text (optional field)', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {});

      const errors = await validate(dto);

      const textError = errors.find((e) => e.property === 'text');
      expect(textError).toBeUndefined();
    });
  });

  describe('price range validation', () => {
    it('should accept valid price range where minPrice <= maxPrice', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        minPrice: 100,
        maxPrice: 1000,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept equal minPrice and maxPrice', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        minPrice: 500,
        maxPrice: 500,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should reject when minPrice > maxPrice', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        minPrice: 1000,
        maxPrice: 100,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const maxPriceError = errors.find((e) => e.property === 'maxPrice');
      expect(maxPriceError).toBeDefined();
      expect(maxPriceError?.constraints).toHaveProperty('isValidPriceRange');
    });

    it('should reject negative minPrice', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        minPrice: -10,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const minPriceError = errors.find((e) => e.property === 'minPrice');
      expect(minPriceError).toBeDefined();
    });

    it('should reject negative maxPrice', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        maxPrice: -10,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const maxPriceError = errors.find((e) => e.property === 'maxPrice');
      expect(maxPriceError).toBeDefined();
    });

    it('should accept only minPrice without maxPrice', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        minPrice: 100,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept only maxPrice without minPrice', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        maxPrice: 1000,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('geolocation validation', () => {
    it('should accept valid lat and lon together', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        lat: 40.7128,
        lon: -74.006,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should reject when only lat is provided', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        lat: 40.7128,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const latError = errors.find((e) => e.property === 'lat');
      expect(latError).toBeDefined();
      expect(latError?.constraints).toHaveProperty('isValidGeoFilter');
    });

    it('should reject when only lon is provided', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        lon: -74.006,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const lonError = errors.find((e) => e.property === 'lon');
      expect(lonError).toBeDefined();
      expect(lonError?.constraints).toHaveProperty('isValidGeoFilter');
    });

    it('should reject lat below -90', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        lat: -91,
        lon: -74.006,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const latError = errors.find((e) => e.property === 'lat');
      expect(latError).toBeDefined();
    });

    it('should reject lat above 90', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        lat: 91,
        lon: -74.006,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const latError = errors.find((e) => e.property === 'lat');
      expect(latError).toBeDefined();
    });

    it('should reject lon below -180', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        lat: 40.7128,
        lon: -181,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const lonError = errors.find((e) => e.property === 'lon');
      expect(lonError).toBeDefined();
    });

    it('should reject lon above 180', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        lat: 40.7128,
        lon: 181,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const lonError = errors.find((e) => e.property === 'lon');
      expect(lonError).toBeDefined();
    });
  });

  describe('pagination validation', () => {
    it('should accept valid page number', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        page: 5,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should reject page number less than 1', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        page: 0,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const pageError = errors.find((e) => e.property === 'page');
      expect(pageError).toBeDefined();
    });

    it('should use default page value of 1', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {});

      expect(dto.page).toBe(1);
    });

    it('should accept valid limit', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        limit: 50,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should reject limit greater than 100', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        limit: 101,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const limitError = errors.find((e) => e.property === 'limit');
      expect(limitError).toBeDefined();
    });

    it('should reject limit of 0', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        limit: 0,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const limitError = errors.find((e) => e.property === 'limit');
      expect(limitError).toBeDefined();
    });

    it('should use default limit value of 20', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {});

      expect(dto.limit).toBe(20);
    });
  });

  describe('sort validation', () => {
    it('should accept valid sort option: relevance', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        sort: ProductSortOptions.RELEVANCE,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept valid sort option: popularity', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        sort: ProductSortOptions.POPULARITY,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept valid sort option: created_at', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        sort: ProductSortOptions.CREATED_AT,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept valid sort option: price_asc', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        sort: ProductSortOptions.PRICE_ASC,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should accept valid sort option: price_desc', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        sort: ProductSortOptions.PRICE_DESC,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should reject invalid sort option', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        sort: 'invalid_sort',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const sortError = errors.find((e) => e.property === 'sort');
      expect(sortError).toBeDefined();
      expect(sortError?.constraints?.isIn).toBeDefined();
    });

    it('should use default sort value of relevance', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {});

      expect(dto.sort).toBe(ProductSortOptions.RELEVANCE);
    });
  });

  describe('subcategories transformation', () => {
    it('should transform comma-separated string to array', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        subcategories: 'Laptops,Cameras,Phones',
      });

      expect(Array.isArray(dto.subcategories)).toBe(true);
      expect(dto.subcategories).toEqual(['Laptops', 'Cameras', 'Phones']);
    });

    it('should keep array as is when already an array', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        subcategories: ['Laptops', 'Cameras'],
      });

      expect(Array.isArray(dto.subcategories)).toBe(true);
      expect(dto.subcategories).toEqual(['Laptops', 'Cameras']);
    });

    it('should validate that each subcategory is a string', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        subcategories: ['Laptops', 123, 'Cameras'],
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      const subcategoriesError = errors.find(
        (e) => e.property === 'subcategories',
      );
      expect(subcategoriesError).toBeDefined();
    });

    it('should accept empty subcategories array', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        subcategories: [],
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('combined validations', () => {
    it('should validate complex query with all valid fields', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        text: 'laptop',
        category: 'Electronics',
        subcategories: 'Laptops,Computers',
        minPrice: 500,
        maxPrice: 2000,
        lat: 40.7128,
        lon: -74.006,
        radiusKm: 10,
        page: 2,
        limit: 50,
        sort: ProductSortOptions.PRICE_ASC,
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should report multiple validation errors', async () => {
      const dto = plainToInstance(SearchProductsQueryDto, {
        text: 'a'.repeat(501),
        minPrice: 1000,
        maxPrice: 100,
        lat: 40.7128,
        // lon missing
        page: 0,
        limit: 101,
        sort: 'invalid',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'text')).toBe(true);
      expect(errors.some((e) => e.property === 'maxPrice')).toBe(true);
      expect(errors.some((e) => e.property === 'lat')).toBe(true);
      expect(errors.some((e) => e.property === 'page')).toBe(true);
      expect(errors.some((e) => e.property === 'limit')).toBe(true);
      expect(errors.some((e) => e.property === 'sort')).toBe(true);
    });
  });
});

