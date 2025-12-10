import { ProductProps } from '../../../domain/contracts/product.props';
import { Product } from '../../../domain/entities/product.entity';
import { ProductDocument } from './product.document';

export class ProductMapper {
  static toDocument(product: Product): ProductDocument {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      subcategories: product.subcategories,
      price: product.price,
      location: {
        lat: product.latitude,
        lon: product.longitude,
      },
      popularity: product.popularity,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }

  static toDomain(document: ProductDocument): Product {
    const props: ProductProps = {
      id: document.id,
      name: document.name,
      description: document.description,
      category: document.category,
      subcategories: document.subcategories,
      price: document.price,
      latitude: document.location.lat,
      longitude: document.location.lon,
      popularity: document.popularity,
      createdAt: new Date(document.createdAt),
      updatedAt: new Date(document.updatedAt),
    };

    return Product.reconstitute(props);
  }

  static toDomainMany(documents: ProductDocument[]): Product[] {
    return documents.map((document) => this.toDomain(document));
  }
}
