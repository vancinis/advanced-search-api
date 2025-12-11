import { runSeeders } from '@/common/database/seeds';
import 'dotenv/config';
import dataSource from '../orm.config';

async function seed() {
  try {
    await dataSource.initialize();
    console.log('Database connected');

    await runSeeders(dataSource);

    await dataSource.destroy();
    console.log('Database disconnected');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
