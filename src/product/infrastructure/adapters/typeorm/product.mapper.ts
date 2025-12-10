import { ProductProps } from '../../../domain/contracts/product.props';
import { Product } from '../../../domain/entities/product.entity';
import { ProductOrmEntity } from './product.orm-entity';

export class ProductMapper {
  static toDomain(ormEntity: ProductOrmEntity): Product {
    const props: ProductProps = {
      id: ormEntity.id,
      name: ormEntity.name,
      description: ormEntity.description,
      category: ormEntity.category,
      subcategories: ormEntity.subcategories ?? [],
      price: ormEntity.price,
      latitude: ormEntity.latitude,
      longitude: ormEntity.longitude,
      popularity: ormEntity.popularity,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    };

    return Product.reconstitute(props);
  }

  static toDomainMany(ormEntities: ProductOrmEntity[]): Product[] {
    return ormEntities.map((entity) => this.toDomain(entity));
  }

  static toOrm(product: Product): ProductOrmEntity {
    const ormEntity = new ProductOrmEntity();

    ormEntity.id = product.id;
    ormEntity.name = product.name;
    ormEntity.description = product.description;
    ormEntity.category = product.category;
    ormEntity.subcategories = product.subcategories;
    ormEntity.price = product.price;
    ormEntity.latitude = product.latitude;
    ormEntity.longitude = product.longitude;
    ormEntity.popularity = product.popularity;

    if (product.createdAt) ormEntity.createdAt = product.createdAt;
    if (product.updatedAt) ormEntity.updatedAt = product.updatedAt;

    return ormEntity;
  }

  static toOrmForCreate(product: Product): ProductOrmEntity {
    const entity = new ProductOrmEntity();

    entity.id = product.id;
    entity.name = product.name;
    entity.description = product.description;
    entity.category = product.category;
    entity.subcategories = product.subcategories;
    entity.price = product.price;
    entity.latitude = product.latitude;
    entity.longitude = product.longitude;
    entity.popularity = product.popularity;

    return entity;
  }

  static toOrmForUpdate(
    product: Product,
    existingOrm: ProductOrmEntity,
  ): ProductOrmEntity {
    existingOrm.name = product.name;
    existingOrm.description = product.description;
    existingOrm.category = product.category;
    existingOrm.subcategories = product.subcategories;
    existingOrm.price = product.price;
    existingOrm.latitude = product.latitude;
    existingOrm.longitude = product.longitude;
    existingOrm.popularity = product.popularity;

    return existingOrm;
  }
}
