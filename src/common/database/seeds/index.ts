// src/common/database/seeds/index.ts
import { DataSource } from 'typeorm';

const seeders = [];

export async function runSeeders(dataSource: DataSource): Promise<void> {
  console.log('🌱 Running seeders...');

  // for (const SeederClass of seeders) {
  //   const seeder = new SeederClass();
  //   await seeder.run(dataSource);
  // }

  console.log('✓ All seeders completed');
}
