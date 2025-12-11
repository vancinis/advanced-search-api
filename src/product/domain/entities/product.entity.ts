import { v4 as uuidv4 } from 'uuid';
import { ProductProps } from '../contracts/product.props';
import { InvalidProductException } from '../exceptions/product.exception';

export class Product {
  private constructor(
    private readonly props: ProductProps & { subcategories: string[] },
  ) {}

  static create(
    props: Omit<ProductProps, 'id' | 'createdAt' | 'updatedAt' | 'popularity'>,
  ): Product {
    const now = new Date();

    const normalizedName = props.name?.trim();
    const normalizedCategory = props.category?.trim();
    const normalizedSubcategories =
      props.subcategories?.map((s) => s.trim()).filter(Boolean) ?? [];

    const id = uuidv4();

    if (!normalizedName)
      throw new InvalidProductException('Product name is required');
    if (!normalizedCategory)
      throw new InvalidProductException('Product category is required');

    return new Product({
      ...props,
      id: id,
      name: normalizedName,
      category: normalizedCategory,
      subcategories: normalizedSubcategories,
      popularity: 0,
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(props: ProductProps): Product {
    const normalizedName = props.name?.trim();
    const normalizedCategory = props.category?.trim();
    const normalizedSubcategories =
      props.subcategories?.map((s) => s.trim()).filter(Boolean) ?? [];

    Product.ensureValid({
      ...props,
      name: normalizedName,
      category: normalizedCategory,
      subcategories: normalizedSubcategories,
    });

    return new Product({
      ...props,
      name: normalizedName,
      category: normalizedCategory,
      popularity: props.popularity ?? 0,
      subcategories: normalizedSubcategories,
    });
  }

  // --- Getters de solo lectura ---
  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get description(): string {
    return this.props.description;
  }

  get category(): string {
    return this.props.category;
  }

  get subcategories(): string[] {
    return [...this.props.subcategories];
  }

  get price(): number {
    return this.props.price;
  }

  get latitude(): number {
    return this.props.latitude;
  }

  get longitude(): number {
    return this.props.longitude;
  }

  get popularity(): number {
    return this.props.popularity ?? 0;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Útil para devolver a la aplicación o a los adaptadores.
   */
  toPrimitives(): ProductProps {
    return {
      ...this.props,
      subcategories: [...this.props.subcategories],
      popularity: this.popularity,
    };
  }

  // --- Validaciones mínimas para asegurar datos consistentes ---
  private static ensureValid(
    props: ProductProps & { subcategories: string[] },
  ): void {
    if (!props.id) throw new InvalidProductException('Product id is required');
    if (!props.name?.trim())
      throw new InvalidProductException('Product name is required');
    if (!props.category?.trim())
      throw new InvalidProductException('Product category is required');
  }
}
