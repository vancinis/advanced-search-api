import { ProductProps } from '../../../domain/contracts/product.props';
import { Product } from '../../../domain/entities/product.entity';
import { ProductOrmEntity } from './product.orm-entity';

export class TypeOrmProductMapper {
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

  private static mapCommonFields(
    target: ProductOrmEntity,
    source: Product,
  ): void {
    target.id = source.id;
    target.name = source.name;
    target.description = source.description;
    target.category = source.category;
    target.subcategories = source.subcategories;
    target.price = source.price;
    target.latitude = source.latitude;
    target.longitude = source.longitude;
    target.popularity = source.popularity;
  }

  static toOrm(product: Product): ProductOrmEntity {
    const ormEntity = new ProductOrmEntity();

    this.mapCommonFields(ormEntity, product);

    if (product.createdAt) ormEntity.createdAt = product.createdAt;
    if (product.updatedAt) ormEntity.updatedAt = product.updatedAt;

    return ormEntity;
  }

  static toOrmForCreate(product: Product): ProductOrmEntity {
    const entity = new ProductOrmEntity();

    this.mapCommonFields(entity, product);

    return entity;
  }

  static toOrmForUpdate(
    product: Product,
    existingOrm: ProductOrmEntity,
  ): ProductOrmEntity {
    this.mapCommonFields(existingOrm, product);

    return existingOrm;
  }
}
