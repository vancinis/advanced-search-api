import { Module } from '@nestjs/common';
import { ProductController } from './infrastructure/http/product.controller';

@Module({
  controllers: [ProductController],
  providers: [],
})
export class ProductModule {}
