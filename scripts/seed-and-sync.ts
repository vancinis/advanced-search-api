import { config } from 'dotenv';
import { execSync } from 'node:child_process';

config();

async function seedAndSync() {
  try {
    console.log('🌱 Step 1: Seeding database...');
    execSync('pnpm run seed', { stdio: 'inherit' });

    console.log('\n⏳ Waiting 3 seconds for database to settle...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log('\n🔄 Step 2: Syncing to Elasticsearch...');
    execSync('pnpm run sync:elasticsearch', { stdio: 'inherit' });

    console.log('\n✅ All done! Database and Elasticsearch are ready.');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedAndSync();
