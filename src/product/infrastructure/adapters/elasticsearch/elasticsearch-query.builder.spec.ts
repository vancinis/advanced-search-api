import { ProductSortOptions } from '../../../domain/contracts/sort-options';
import { SearchFilters } from '../../../domain/ports/product-search.port';
import { ElasticsearchQueryBuilder } from './elasticsearch-query.builder';

describe('ElasticsearchQueryBuilder', () => {
  describe('buildSearchQuery', () => {
    it('should create multi_match query with fuzziness when text is provided', () => {
      const filters: SearchFilters = {
        text: 'laptop',
        page: 1,
        limit: 20,
      };

      const query = ElasticsearchQueryBuilder.buildSearchQuery(filters);

      expect(query).toHaveProperty('bool');
      expect(query.bool).toHaveProperty('must');
      expect(query.bool!.must).toHaveLength(1);
      expect(query.bool!.must![0]).toEqual({
        multi_match: {
          query: 'laptop',
          fields: ['name^2', 'description'],
          fuzziness: 'AUTO',
          operator: 'and',
        },
      });
    });

    it('should create term filter when category is provided', () => {
      const filters: SearchFilters = {
        category: 'Electronics',
        page: 1,
        limit: 20,
      };

      const query = ElasticsearchQueryBuilder.buildSearchQuery(filters);

      expect(query).toHaveProperty('bool');
      expect(query.bool).toHaveProperty('filter');
      expect(query.bool!.filter).toHaveLength(1);
      expect(query.bool!.filter![0]).toEqual({
        term: { category: 'Electronics' },
      });
    });

    it('should create terms filter when subcategories are provided', () => {
      const filters: SearchFilters = {
        subcategories: ['Laptops', 'Cameras'],
        page: 1,
        limit: 20,
      };

      const query = ElasticsearchQueryBuilder.buildSearchQuery(filters);

      expect(query).toHaveProperty('bool');
      expect(query.bool).toHaveProperty('filter');
      expect(query.bool!.filter).toHaveLength(1);
      expect(query.bool!.filter![0]).toEqual({
        terms: {
          subcategories: ['Laptops', 'Cameras'],
        },
      });
    });

    it('should not create filter when subcategories array is empty', () => {
      const filters: SearchFilters = {
        subcategories: [],
        page: 1,
        limit: 20,
      };

      const query = ElasticsearchQueryBuilder.buildSearchQuery(filters);

      expect(query).toEqual({ match_all: {} });
    });

    it('should create range query when only minPrice is provided', () => {
      const filters: SearchFilters = {
        minPrice: 100,
        page: 1,
        limit: 20,
      };

      const query = ElasticsearchQueryBuilder.buildSearchQuery(filters);

      expect(query.bool!.filter![0]).toEqual({
        range: { price: { gte: 100 } },
      });
    });

    it('should create range query when only maxPrice is provided', () => {
      const filters: SearchFilters = {
        maxPrice: 1000,
        page: 1,
        limit: 20,
      };

      const query = ElasticsearchQueryBuilder.buildSearchQuery(filters);

      expect(query.bool!.filter![0]).toEqual({
        range: { price: { lte: 1000 } },
      });
    });

    it('should create range query with both minPrice and maxPrice', () => {
      const filters: SearchFilters = {
        minPrice: 100,
        maxPrice: 1000,
        page: 1,
        limit: 20,
      };

      const query = ElasticsearchQueryBuilder.buildSearchQuery(filters);

      expect(query.bool!.filter![0]).toEqual({
        range: { price: { gte: 100, lte: 1000 } },
      });
    });

    it('should create geo_distance filter when location parameters are provided', () => {
      const filters: SearchFilters = {
        lat: 40.7128,
        lon: -74.006,
        radiusKm: 10,
        page: 1,
        limit: 20,
      };

      const query = ElasticsearchQueryBuilder.buildSearchQuery(filters);

      expect(query.bool!.filter![0]).toEqual({
        geo_distance: {
          distance: '10km',
          location: {
            lat: 40.7128,
            lon: -74.006,
          },
        },
      });
    });

    it('should not create geo_distance filter when radiusKm is missing', () => {
      const filters: SearchFilters = {
        lat: 40.7128,
        lon: -74.006,
        page: 1,
        limit: 20,
      };

      const query = ElasticsearchQueryBuilder.buildSearchQuery(filters);

      expect(query).toEqual({ match_all: {} });
    });

    it('should return match_all when no filters are provided', () => {
      const filters: SearchFilters = {
        page: 1,
        limit: 20,
      };

      const query = ElasticsearchQueryBuilder.buildSearchQuery(filters);

      expect(query).toEqual({ match_all: {} });
    });

    it('should combine multiple filters with correct bool structure', () => {
      const filters: SearchFilters = {
        text: 'laptop',
        category: 'Electronics',
        subcategories: ['Laptops', 'Computers'],
        minPrice: 100,
        maxPrice: 2000,
        lat: 40.7128,
        lon: -74.006,
        radiusKm: 10,
        page: 1,
        limit: 20,
      };

      const query = ElasticsearchQueryBuilder.buildSearchQuery(filters);

      expect(query).toHaveProperty('bool');
      expect(query.bool).toHaveProperty('must');
      expect(query.bool).toHaveProperty('filter');
      expect(query.bool!.must).toHaveLength(1); // text search
      expect(query.bool!.filter).toHaveLength(4); // category, subcategories, price, geo
    });

    it('should handle text search with filters but no must clauses', () => {
      const filters: SearchFilters = {
        category: 'Electronics',
        minPrice: 100,
        page: 1,
        limit: 20,
      };

      const query = ElasticsearchQueryBuilder.buildSearchQuery(filters);

      expect(query.bool).not.toHaveProperty('must');
      expect(query.bool).toHaveProperty('filter');
      expect(query.bool!.filter).toHaveLength(2);
    });
  });

  describe('buildSort', () => {
    it('should return relevance sort by default', () => {
      const sort = ElasticsearchQueryBuilder.buildSort();

      expect(sort).toEqual([
        { _score: { order: 'desc' } },
        { popularity: { order: 'desc' } },
      ]);
    });

    it('should return relevance sort when RELEVANCE option is provided', () => {
      const sort = ElasticsearchQueryBuilder.buildSort(
        ProductSortOptions.RELEVANCE,
      );

      expect(sort).toEqual([
        { _score: { order: 'desc' } },
        { popularity: { order: 'desc' } },
      ]);
    });

    it('should return popularity sort when POPULARITY option is provided', () => {
      const sort = ElasticsearchQueryBuilder.buildSort(
        ProductSortOptions.POPULARITY,
      );

      expect(sort).toEqual([
        { popularity: { order: 'desc' } },
        { _score: { order: 'desc' } },
      ]);
    });

    it('should return created_at sort when CREATED_AT option is provided', () => {
      const sort = ElasticsearchQueryBuilder.buildSort(
        ProductSortOptions.CREATED_AT,
      );

      expect(sort).toEqual([{ createdAt: { order: 'desc' } }]);
    });

    it('should return price ascending sort when PRICE_ASC option is provided', () => {
      const sort = ElasticsearchQueryBuilder.buildSort(
        ProductSortOptions.PRICE_ASC,
      );

      expect(sort).toEqual([{ price: { order: 'asc' } }]);
    });

    it('should return price descending sort when PRICE_DESC option is provided', () => {
      const sort = ElasticsearchQueryBuilder.buildSort(
        ProductSortOptions.PRICE_DESC,
      );

      expect(sort).toEqual([{ price: { order: 'desc' } }]);
    });

    it('should return default sort for unknown option', () => {
      const sort = ElasticsearchQueryBuilder.buildSort('invalid' as any);

      expect(sort).toEqual([
        { _score: { order: 'desc' } },
        { popularity: { order: 'desc' } },
      ]);
    });
  });

  describe('buildAggregations', () => {
    it('should return correct aggregations structure', () => {
      const aggs = ElasticsearchQueryBuilder.buildAggregations();

      expect(aggs).toHaveProperty('categories');
      expect(aggs).toHaveProperty('subcategories');
      expect(aggs).toHaveProperty('price_ranges');
    });

    it('should configure categories aggregation correctly', () => {
      const aggs = ElasticsearchQueryBuilder.buildAggregations();

      expect(aggs.categories).toEqual({
        terms: {
          field: 'category',
          size: 50,
        },
      });
    });

    it('should configure subcategories aggregation correctly', () => {
      const aggs = ElasticsearchQueryBuilder.buildAggregations();

      expect(aggs.subcategories).toEqual({
        terms: {
          field: 'subcategories',
          size: 100,
        },
      });
    });

    it('should configure price_ranges aggregation with correct buckets', () => {
      const aggs = ElasticsearchQueryBuilder.buildAggregations();

      expect(aggs.price_ranges).toEqual({
        range: {
          field: 'price',
          ranges: [
            { key: '0-50', to: 50 },
            { key: '50-100', from: 50, to: 100 },
            { key: '100-500', from: 100, to: 500 },
            { key: '500-1000', from: 500, to: 1000 },
            { key: '1000+', from: 1000 },
          ],
        },
      });
    });
  });

  describe('buildAutocompleteQuery', () => {
    it('should create query with multiple match strategies', () => {
      const query = ElasticsearchQueryBuilder.buildAutocompleteQuery('lapt');

      expect(query).toHaveProperty('bool');
      expect(query.bool).toHaveProperty('should');
      expect(query.bool).toHaveProperty('minimum_should_match');
      expect(query.bool!.should).toHaveLength(3);
    });

    it('should include autocomplete match with highest boost', () => {
      const query = ElasticsearchQueryBuilder.buildAutocompleteQuery('lapt');

      expect(query.bool!.should![0]).toEqual({
        match: {
          'name.autocomplete': {
            query: 'lapt',
            boost: 3,
          },
        },
      });
    });

    it('should include match_phrase_prefix with medium boost', () => {
      const query = ElasticsearchQueryBuilder.buildAutocompleteQuery('lapt');

      expect(query.bool!.should![1]).toEqual({
        match_phrase_prefix: {
          name: {
            query: 'lapt',
            boost: 2,
          },
        },
      });
    });

    it('should include fuzzy match with lowest boost', () => {
      const query = ElasticsearchQueryBuilder.buildAutocompleteQuery('lapt');

      expect(query.bool!.should![2]).toEqual({
        fuzzy: {
          name: {
            value: 'lapt',
            fuzziness: 'AUTO',
            boost: 1,
          },
        },
      });
    });

    it('should require at least one match', () => {
      const query = ElasticsearchQueryBuilder.buildAutocompleteQuery('lapt');

      expect(query.bool!.minimum_should_match).toBe(1);
    });

    it('should work with different input text', () => {
      const query = ElasticsearchQueryBuilder.buildAutocompleteQuery('phone');

      expect(query.bool!.should![0]).toHaveProperty('match');
      expect(
        (query.bool!.should![0] as any).match['name.autocomplete'].query,
      ).toBe('phone');
    });
  });
});

