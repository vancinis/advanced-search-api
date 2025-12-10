import { ProductProps } from '../contracts/product.props';

export class Product {
  private constructor(
    private readonly props: ProductProps & { subcategories: string[] },
  ) {}

  static reconstitute(props: ProductProps): Product {
    const normalizedSubcategories =
      props.subcategories?.map((s) => s.trim()).filter(Boolean) ?? [];

    Product.ensureValid({ ...props, subcategories: normalizedSubcategories });

    return new Product({
      ...props,
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
    if (!props.id) throw new Error('Product id is required');
    if (!props.name?.trim()) throw new Error('Product name is required');
    if (!props.category?.trim())
      throw new Error('Product category is required');
  }
}
