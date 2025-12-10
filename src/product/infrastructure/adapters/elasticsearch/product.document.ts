import { estypes } from '@elastic/elasticsearch';

export interface ProductDocument {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategories: string[];
  price: number;
  location: {
    lat: number;
    lon: number;
  };
  popularity: number;
  createdAt: string;
  updatedAt: string;
}

export const PRODUCT_MAPPING: estypes.MappingTypeMapping = {
  properties: {
    id: { type: 'keyword' },
    name: {
      type: 'text',
      analyzer: 'standard',
      fields: {
        keyword: { type: 'keyword' },
        autocomplete: {
          type: 'text',
          analyzer: 'autocomplete',
          search_analyzer: 'autocomplete_search',
        },
      },
    },
    description: {
      type: 'text',
      analyzer: 'standard',
    },
    category: {
      type: 'keyword',
    },
    subcategories: {
      type: 'keyword',
    },
    price: {
      type: 'double',
    },
    location: {
      type: 'geo_point',
    },
    popularity: {
      type: 'integer',
    },
    createdAt: {
      type: 'date',
    },
    updatedAt: {
      type: 'date',
    },
  },
};

export const PRODUCT_SETTINGS: estypes.IndicesIndexSettings = {
  analysis: {
    analyzer: {
      autocomplete: {
        type: 'custom',
        tokenizer: 'standard',
        filter: ['lowercase', 'asciifolding', 'autocomplete_filter'],
      },
      autocomplete_search: {
        type: 'custom',
        tokenizer: 'standard',
        filter: ['lowercase', 'asciifolding'],
      },
    },
    filter: {
      autocomplete_filter: {
        type: 'edge_ngram',
        min_gram: 2,
        max_gram: 20,
      },
    },
  },
};
