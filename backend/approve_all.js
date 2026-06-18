const { Client } = require('pg');

async function run() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'EcoHabit_db',
    password: '123456',
    port: 5432,
  });

  await client.connect();
  try {
    const res1 = await client.query("UPDATE dropoff_transactions SET status = 'VERIFIED' WHERE status = 'PENDING'");
    console.log(`Updated ${res1.rowCount} dropoff transactions to VERIFIED.`);
    
    const res2 = await client.query("UPDATE locations SET status = 'APPROVED' WHERE status = 'PENDING'");
    console.log(`Updated ${res2.rowCount} locations to APPROVED.`);
    
  } catch (err) {
    console.error('Error updating DB:', err);
  } finally {
    await client.end();
  }
}

run();
