import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class ColumnNumericTransformer {
  to(data: number): number {
    return data;
  }
  from(data: string): number {
    return Number.parseFloat(data);
  }
}

@Entity('products')
@Index(['category'])
@Index(['createdAt'])
export class ProductOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column('text')
  description: string;

  @Column({ length: 100 })
  category: string;

  @Column('simple-array')
  subcategories: string[];

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  price: number;

  @Column('decimal', {
    precision: 10,
    scale: 7,
    transformer: new ColumnNumericTransformer(),
  })
  latitude: number;

  @Column('decimal', {
    precision: 10,
    scale: 7,
    transformer: new ColumnNumericTransformer(),
  })
  longitude: number;

  @Column({ type: 'int', default: 0 })
  popularity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
