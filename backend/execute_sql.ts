import { AppDataSource } from './src/data-source';
import * as fs from 'fs';

async function run() {
  await AppDataSource.initialize();
  const query = fs.readFileSync('temp_hoakhanh.sql', 'utf8');
  await AppDataSource.query(query);
  console.log('Seed executed successfully!');
  process.exit(0);
}
run().catch(console.error);
