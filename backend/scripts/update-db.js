const { Client } = require('pg');
const client = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: '123456', database: 'EcoHabit_db' });
client.connect().then(async () => {
  await client.query("UPDATE locations SET latitude=10.7745, longitude=106.7020 WHERE id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1'");
  await client.query("UPDATE locations SET latitude=10.7720, longitude=106.7050 WHERE id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'");
  console.log('Seed locations in DB updated!');
  await client.end();
}).catch(e => console.error(e));
