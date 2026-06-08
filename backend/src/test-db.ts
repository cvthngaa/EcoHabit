import { AppDataSource } from './data-source';

async function test() {
  await AppDataSource.initialize();
  
  const queryRunner = AppDataSource.createQueryRunner();
  const table = await queryRunner.getTable('rewards');
  console.log('Columns: ', table?.columns.map(c => c.name));
  
  const testReward = {
    name: 'Test Reward (Có ảnh)',
    description: 'Đây là quà tặng để test tính năng ảnh mới',
    points_cost: 50,
    stock: 99,
    status: 'ACTIVE',
    thumbnail_url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=300&auto=format&fit=crop'
  };

  await AppDataSource.query(`
    INSERT INTO rewards (name, description, points_cost, stock, status, thumbnail_url, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
  `, [testReward.name, testReward.description, testReward.points_cost, testReward.stock, testReward.status, testReward.thumbnail_url]);

  console.log('Inserted test reward with thumbnail!');
  
  await AppDataSource.destroy();
}

test().catch(console.error);
