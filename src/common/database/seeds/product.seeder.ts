import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { ProductOrmEntity } from '../../../product/infrastructure/adapters/typeorm/product.orm-entity';

/**
 * Configuración de categorías y subcategorías realistas
 */
const CATEGORIES_CONFIG = {
  Electronics: {
    subcategories: [
      'Smartphones',
      'Laptops',
      'Tablets',
      'Headphones',
      'Cameras',
      'Smartwatches',
    ],
    priceRange: { min: 99, max: 3500 },
    brands: ['Apple', 'Samsung', 'Sony', 'Dell', 'HP', 'Lenovo', 'ASUS', 'LG'],
  },
  'Home & Garden': {
    subcategories: [
      'Furniture',
      'Kitchen',
      'Decor',
      'Tools',
      'Lighting',
      'Bedding',
    ],
    priceRange: { min: 19, max: 2000 },
    brands: [
      'IKEA',
      'Wayfair',
      'Ashley',
      'Herman Miller',
      'KitchenAid',
      'Cuisinart',
    ],
  },
  'Sports & Outdoors': {
    subcategories: [
      'Fitness',
      'Camping',
      'Cycling',
      'Running',
      'Swimming',
      'Hiking',
    ],
    priceRange: { min: 15, max: 2500 },
    brands: ['Nike', 'Adidas', 'Patagonia', 'North Face', 'Yeti', 'Peloton'],
  },
  Books: {
    subcategories: [
      'Programming',
      'Business',
      'Self-Help',
      'Fiction',
      'Biography',
      'Science',
    ],
    priceRange: { min: 9, max: 89 },
    brands: [
      "O'Reilly",
      'Penguin',
      'Harper',
      'Simon & Schuster',
      'Random House',
    ],
  },
  Fashion: {
    subcategories: [
      'Shoes',
      'Clothing',
      'Accessories',
      'Watches',
      'Bags',
      'Jewelry',
    ],
    priceRange: { min: 25, max: 1500 },
    brands: ['Nike', 'Adidas', "Levi's", 'Ray-Ban', 'Fossil', 'Michael Kors'],
  },
  'Beauty & Health': {
    subcategories: [
      'Skincare',
      'Makeup',
      'Haircare',
      'Fragrances',
      'Supplements',
      'Personal Care',
    ],
    priceRange: { min: 12, max: 350 },
    brands: [
      'Estée Lauder',
      "L'Oréal",
      'Clinique',
      'MAC',
      'Neutrogena',
      'Cetaphil',
    ],
  },
  Toys: {
    subcategories: [
      'Action Figures',
      'Board Games',
      'Educational',
      'Outdoor Play',
      'Puzzles',
      'Building',
    ],
    priceRange: { min: 9, max: 299 },
    brands: [
      'LEGO',
      'Hasbro',
      'Mattel',
      'Fisher-Price',
      'Ravensburger',
      'Playmobil',
    ],
  },
  Automotive: {
    subcategories: [
      'Parts',
      'Accessories',
      'Tools',
      'Care',
      'Electronics',
      'Interior',
    ],
    priceRange: { min: 19, max: 899 },
    brands: ['Bosch', 'Michelin', 'Garmin', 'Thule', 'WeatherTech', '3M'],
  },
};

/**
 * Ciudades importantes de USA para geo-distribución
 */
const US_CITIES = [
  { name: 'New York', lat: 40.7128, lon: -74.006 },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
  { name: 'Chicago', lat: 41.8781, lon: -87.6298 },
  { name: 'Houston', lat: 29.7604, lon: -95.3698 },
  { name: 'Phoenix', lat: 33.4484, lon: -112.074 },
  { name: 'Philadelphia', lat: 39.9526, lon: -75.1652 },
  { name: 'San Antonio', lat: 29.4241, lon: -98.4936 },
  { name: 'San Diego', lat: 32.7157, lon: -117.1611 },
  { name: 'Dallas', lat: 32.7767, lon: -96.797 },
  { name: 'San Jose', lat: 37.3382, lon: -121.8863 },
  { name: 'Austin', lat: 30.2672, lon: -97.7431 },
  { name: 'Jacksonville', lat: 30.3322, lon: -81.6557 },
  { name: 'San Francisco', lat: 37.7749, lon: -122.4194 },
  { name: 'Seattle', lat: 47.6062, lon: -122.3321 },
  { name: 'Denver', lat: 39.7392, lon: -104.9903 },
  { name: 'Boston', lat: 42.3601, lon: -71.0589 },
  { name: 'Miami', lat: 25.7617, lon: -80.1918 },
  { name: 'Atlanta', lat: 33.749, lon: -84.388 },
  { name: 'Portland', lat: 45.5152, lon: -122.6784 },
  { name: 'Las Vegas', lat: 36.1699, lon: -115.1398 },
];

export class ProductSeeder {
  async run(dataSource: DataSource): Promise<void> {
    const repository = dataSource.getRepository(ProductOrmEntity);

    console.log('🔍 Checking existing products...');
    const existingCount = await repository.count();

    if (existingCount > 0) {
      console.log(
        `ℹ️  Database already has ${existingCount} products. Skipping seed.`,
      );
      return;
    }

    console.log('🌱 Generating 100 realistic products with Faker...');

    const products: Partial<ProductOrmEntity>[] = [];
    const categories = Object.keys(CATEGORIES_CONFIG);

    for (let i = 0; i < 100; i++) {
      // Seleccionar categoría aleatoria
      const category = faker.helpers.arrayElement(categories);
      const config = CATEGORIES_CONFIG[category];

      // Seleccionar 1-3 subcategorías aleatorias
      const numSubcategories = faker.number.int({ min: 1, max: 3 });
      const subcategories: string[] = faker.helpers.arrayElements(
        config.subcategories,
        numSubcategories,
      );

      // Agregar una marca aleatoria a las subcategorías
      const brand: string = faker.helpers.arrayElement(config.brands);
      subcategories.push(brand);

      // Generar precio dentro del rango de la categoría
      const price = faker.number.float({
        min: config.priceRange.min,
        max: config.priceRange.max,
        fractionDigits: 2,
      });

      // Seleccionar ciudad aleatoria
      const city = faker.helpers.arrayElement(US_CITIES);

      // Generar popularidad (distribución realista con sesgo hacia valores medios)
      const popularity =
        Math.floor(
          faker.number.float({ min: 0, max: 100 }) +
            faker.number.float({ min: 0, max: 100 }) +
            faker.number.float({ min: 0, max: 100 }),
        ) / 3;

      // Generar nombre de producto realista
      const productName = this.generateProductName(
        category,
        brand,
        subcategories,
      );

      // Generar descripción realista
      const description = this.generateDescription(category, productName);

      products.push({
        name: productName,
        description,
        category,
        subcategories,
        price,
        latitude: city.lat,
        longitude: city.lon,
        popularity: Math.round(popularity),
      });

      // Progress
      if ((i + 1) % 10 === 0) {
        process.stdout.write(`\rGenerated: ${i + 1}/100 products`);
      }
    }

    console.log('\n💾 Inserting products into database...');
    await repository.insert(products);

    const count = await repository.count();
    console.log(`✅ Successfully seeded ${count} products`);
  }

  /**
   * Genera nombres de productos realistas según la categoría
   */
  private generateProductName(
    category: string,
    brand: string,
    subcategories: string[],
  ): string {
    const templates = {
      Electronics: [
        `${brand} ${faker.commerce.productName()}`,
        `${brand} ${subcategories[0]} ${faker.commerce.productAdjective()}`,
        `${faker.commerce.productAdjective()} ${brand} ${subcategories[0]}`,
      ],
      'Home & Garden': [
        `${brand} ${faker.commerce.productName()}`,
        `${faker.commerce.productAdjective()} ${subcategories[0]}`,
        `${brand} ${subcategories[0]} ${faker.color.human()}`,
      ],
      'Sports & Outdoors': [
        `${brand} ${faker.commerce.productName()}`,
        `${faker.commerce.productAdjective()} ${subcategories[0]} ${faker.commerce.product()}`,
        `${brand} Pro ${subcategories[0]}`,
      ],
      Books: [
        `${faker.word.adjective()} ${faker.word.noun()} - ${faker.person.fullName()}`,
        `The Art of ${faker.word.noun()}`,
        `${faker.word.adjective()} ${faker.word.noun()}: A Comprehensive Guide`,
      ],
      Fashion: [
        `${brand} ${faker.commerce.productAdjective()} ${subcategories[0]}`,
        `${faker.commerce.productAdjective()} ${faker.color.human()} ${subcategories[0]}`,
        `${brand} ${faker.commerce.productName()}`,
      ],
      'Beauty & Health': [
        `${brand} ${faker.commerce.productAdjective()} ${subcategories[0]}`,
        `${faker.commerce.productAdjective()} ${subcategories[0]} ${faker.commerce.product()}`,
        `${brand} Professional ${subcategories[0]}`,
      ],
      Toys: [
        `${brand} ${faker.commerce.productAdjective()} ${subcategories[0]}`,
        `${faker.commerce.productName()} ${subcategories[0]} Set`,
        `${brand} ${faker.word.adjective()} ${subcategories[0]}`,
      ],
      Automotive: [
        `${brand} ${faker.vehicle.type()} ${subcategories[0]}`,
        `${faker.commerce.productAdjective()} ${subcategories[0]}`,
        `${brand} Professional ${subcategories[0]}`,
      ],
    };

    const template: string = faker.helpers.arrayElement(
      templates[category] || templates.Electronics,
    );

    // Limitar longitud a 200 caracteres (constraint de la DB)
    return template.substring(0, 200);
  }

  /**
   * Genera descripciones realistas
   */
  private generateDescription(category: string, productName: string): string {
    const features = [
      faker.commerce.productDescription(),
      `Perfect for ${faker.word.adjective()} use.`,
      `Features ${faker.word.adjective()} ${faker.word.noun()} and ${faker.word.adjective()} design.`,
      `Ideal for ${faker.word.adjective()} professionals and enthusiasts.`,
    ];

    const description = `${productName}. ${features.join(' ')}`;

    // Limitar a 500 caracteres para ser razonable
    return description.substring(0, 500);
  }
}
