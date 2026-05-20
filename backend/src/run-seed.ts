import { AppDataSource } from './data-source';
import * as fs from 'fs';
import * as path from 'path';

async function runSeed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected.');

    const sqlPath = path.join(__dirname, '..', 'seed_data.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Running seed_data.sql...');
    await AppDataSource.query(sql);

    console.log('Seed data inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

runSeed();
