const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'EcoHabit_db',
});

async function approveAll() {
  await client.connect();
  console.log('✅ Đã kết nối database');

  try {
    await client.query('BEGIN');

    // 1. Duyệt tất cả Dropoff Transactions đang PENDING thành VERIFIED
    const dropoffRes = await client.query(`
      UPDATE dropoff_transactions 
      SET status = 'VERIFIED', 
          confirmed_at = NOW(),
          points_awarded = COALESCE(points_awarded, quantity_value * 100) -- giả sử 1 đơn vị = 100 điểm
      WHERE status = 'PENDING'
      RETURNING id, user_id, points_awarded
    `);
    console.log(`✅ Đã chuyển ${dropoffRes.rowCount} Dropoff Transactions sang VERIFIED`);

    // Ghi nhận điểm cho các dropoff vừa duyệt
    for (const row of dropoffRes.rows) {
      if (row.points_awarded > 0) {
        // Cộng điểm cho user
        await client.query(`
          UPDATE users 
          SET points_balance = points_balance + $1 
          WHERE id = $2
        `, [row.points_awarded, row.user_id]);

        // Lấy số dư mới
        const userRes = await client.query(`SELECT points_balance FROM users WHERE id = $1`, [row.user_id]);
        const balance = userRes.rows[0].points_balance;

        // Thêm giao dịch điểm
        await client.query(`
          INSERT INTO point_transactions (user_id, type, points, balance_after, reason_code, source_type, note)
          VALUES ($1, 'EARN', $2, $3, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Duyệt giao dịch nộp rác hàng loạt')
        `, [row.user_id, row.points_awarded, balance]);
      }
    }

    // 2. Duyệt tất cả Redemptions đang PENDING thành FULFILLED
    const redemptionsRes = await client.query(`
      UPDATE redemptions 
      SET status = 'FULFILLED', updated_at = NOW()
      WHERE status = 'PENDING' OR status = 'APPROVED'
    `);
    console.log(`✅ Đã chuyển ${redemptionsRes.rowCount} Redemptions sang FULFILLED`);

    // 3. Duyệt tất cả Locations đang PENDING thành APPROVED
    const locationsRes = await client.query(`
      UPDATE locations 
      SET status = 'APPROVED', updated_at = NOW()
      WHERE status = 'PENDING'
    `);
    console.log(`✅ Đã chuyển ${locationsRes.rowCount} Locations sang APPROVED`);

    // 4. Duyệt tất cả Partner Profiles đang PENDING thành APPROVED
    const partnersRes = await client.query(`
      UPDATE partner_profiles 
      SET approval_status = 'APPROVED', updated_at = NOW(), approved_at = NOW()
      WHERE approval_status = 'PENDING'
    `);
    console.log(`✅ Đã chuyển ${partnersRes.rowCount} Partner Profiles sang APPROVED`);
    
    // Cập nhật câu hỏi Quiz đang PENDING_REVIEW sang ACTIVE
    const quizRes = await client.query(`
      UPDATE quiz_questions 
      SET status = 'ACTIVE', updated_at = NOW(), reviewed_at = NOW()
      WHERE status = 'PENDING_REVIEW'
    `);
    console.log(`✅ Đã chuyển ${quizRes.rowCount} Quiz Questions sang ACTIVE`);

    await client.query('COMMIT');
    console.log('🎉 Đã hoàn tất việc duyệt tất cả dữ liệu!');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Lỗi:', err);
  } finally {
    await client.end();
  }
}

approveAll().catch(console.error);
