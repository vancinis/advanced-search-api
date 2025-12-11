import { DataSource } from 'typeorm';
import { ProductSeeder } from './product.seeder';

const seeders = [ProductSeeder];

export async function runSeeders(dataSource: DataSource): Promise<void> {
  console.log('🌱 Running seeders...');

  for (const SeederClass of seeders) {
    const seederName = SeederClass.name;
    console.log(`\n📦 Running ${seederName}...`);

    const seeder = new SeederClass();
    await seeder.run(dataSource);
  }

  console.log('✓ All seeders completed');
}
