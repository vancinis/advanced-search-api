import { ProductSortOption } from '../contracts/sort-options';
import { Product } from '../entities/product.entity';

export interface SearchFilters {
  text?: string;
  category?: string;
  subcategories?: string[];
  minPrice?: number;
  maxPrice?: number;
  lat?: number;
  lon?: number;
  radiusKm?: number;
  sort?: ProductSortOption;
  page: number;
  limit: number;
}

export interface FacetBucket {
  key: string;
  count: number;
}

export interface SearchResult {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  facets?: Record<string, FacetBucket[]>;
  suggestedQuery?: string;
}

export interface AutocompleteQuery {
  text: string;
  limit?: number;
}

export interface AutocompleteResult {
  suggestions: string[];
}

export interface ProductSearchPort {
  search(filters: SearchFilters): Promise<SearchResult>;
  findById(id: string): Promise<Product | null>;
  autocomplete(query: AutocompleteQuery): Promise<AutocompleteResult>;
  index(product: Product): Promise<void>;
  checkConnection(): Promise<boolean>;
}

export const PRODUCT_SEARCH_PORT = Symbol('ProductSearchPort');
