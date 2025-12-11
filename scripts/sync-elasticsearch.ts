import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import type { ProductRepositoryPort } from '../src/product/domain/ports/product-repository.port';
import { PRODUCT_REPOSITORY_PORT } from '../src/product/domain/ports/product-repository.port';
import type { ProductSearchPort } from '../src/product/domain/ports/product-search.port';
import { PRODUCT_SEARCH_PORT } from '../src/product/domain/ports/product-search.port';

async function syncElasticsearch() {
  console.log('🔄 Starting Elasticsearch sync...');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const productRepository = app.get<ProductRepositoryPort>(
      PRODUCT_REPOSITORY_PORT,
    );
    const productSearchPort = app.get<ProductSearchPort>(PRODUCT_SEARCH_PORT);

    // Verify connection
    const isConnected = await productSearchPort.checkConnection();
    if (!isConnected) {
      throw new Error('Cannot connect to Elasticsearch');
    }

    console.log('✅ Elasticsearch connection verified');

    // Obtener todos los productos de la DB
    console.log('📦 Fetching products from database...');
    const products = await productRepository.findAll(1, 1000); // For testing purposes, we're only indexing the first 1000 products

    if (products.length === 0) {
      console.log('⚠️  No products found in database. Run seed first.');
      return;
    }

    console.log(`Found ${products.length} products. Indexing...`);

    // Indexar cada producto
    let indexed = 0;
    for (const product of products) {
      try {
        await productSearchPort.index(product);
        indexed++;
        process.stdout.write(`\rIndexed: ${indexed}/${products.length}`);
      } catch (error) {
        console.error(
          `\n❌ Error indexing product ${product.id}:`,
          error.message,
        );
      }
    }

    console.log(
      `\n✅ Successfully indexed ${indexed} products to Elasticsearch`,
    );
  } catch (error) {
    console.error('❌ Error syncing Elasticsearch:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

syncElasticsearch();
