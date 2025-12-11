export const ProductSortOptions = {
  RELEVANCE: 'relevance',
  POPULARITY: 'popularity',
  CREATED_AT: 'created_at',
  PRICE_ASC: 'price_asc',
  PRICE_DESC: 'price_desc',
} as const;

export type ProductSortOption =
  (typeof ProductSortOptions)[keyof typeof ProductSortOptions];

export const AVAILABLE_SORT_OPTIONS = Object.values(ProductSortOptions);
