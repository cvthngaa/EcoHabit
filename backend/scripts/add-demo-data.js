/**
 * EcoHabit - Thêm dữ liệu demo (KHÔNG xóa dữ liệu cũ)
 * Chạy: node add-demo-data.js
 */

const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'EcoHabit_db',
});

function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function hoursAgo(hours) {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

async function addData() {
  await client.connect();
  console.log('✅ Đã kết nối database');

  try {
    await client.query('BEGIN');

    const passwordHash = await bcrypt.hash('Password123!', 10);

    // ============================================================
    // Lấy thông tin admin và partner hiện có
    // ============================================================
    const adminResult = await client.query(`SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1`);
    if (adminResult.rows.length === 0) {
      throw new Error('Không tìm thấy admin. Hãy chạy seed-demo.js trước!');
    }
    const adminId = adminResult.rows[0].id;

    const partnerResult = await client.query(`
      SELECT pp.id as profile_id, u.id as user_id, pp.organization_name
      FROM partner_profiles pp 
      JOIN users u ON u.id = pp.user_id 
      WHERE pp.approval_status = 'APPROVED'
      ORDER BY pp.created_at
    `);
    console.log(`📋 Tìm thấy ${partnerResult.rows.length} partner đã duyệt`);

    const locationResult = await client.query(`
      SELECT id, name, partner_profile_id FROM locations WHERE status = 'APPROVED' ORDER BY created_at
    `);
    console.log(`📍 Tìm thấy ${locationResult.rows.length} locations đã duyệt`);

    const rewardResult = await client.query(`
      SELECT id, name, points_cost, partner_profile_id FROM rewards WHERE status = 'ACTIVE' ORDER BY created_at
    `);
    console.log(`🎁 Tìm thấy ${rewardResult.rows.length} rewards đang hoạt động`);

    const userResult = await client.query(`
      SELECT id, full_name, points_balance FROM users WHERE role = 'USER' AND status = 'ACTIVE' ORDER BY created_at
    `);
    console.log(`👥 Tìm thấy ${userResult.rows.length} users đang hoạt động\n`);

    const partnerIds = partnerResult.rows.map(r => r.user_id);
    const partnerProfileIds = partnerResult.rows.map(r => r.profile_id);
    const locationIds = locationResult.rows.map(r => r.id);
    const rewardIds = rewardResult.rows.map(r => r.id);
    const userIds = userResult.rows.map(r => r.id);

    // ============================================================
    // 1. THÊM USERS MỚI
    // ============================================================
    console.log('👥 Thêm users mới...');
    const ts2 = Date.now();
    const newUserEmails = [
      `nguyen.thi.lan.${ts2}@gmail.com`,
      `tran.van.minh.${ts2}@gmail.com`,
      `pham.thi.nga.${ts2}@gmail.com`,
      `le.van.phong.${ts2}@gmail.com`,
      `hoang.thi.quynh.${ts2}@gmail.com`,
      `do.van.son.${ts2}@gmail.com`,
      `bui.thi.thu.${ts2}@gmail.com`,
      `dang.van.uyen.${ts2}@gmail.com`,
      `vu.thi.van.${ts2}@gmail.com`,
      `mai.van.xuan.${ts2}@gmail.com`,
    ];
    const newUserRows = [
      [uuidv4(), newUserEmails[0], passwordHash, 'Nguyễn Thị Lan', 'https://api.dicebear.com/7.x/avataaars/svg?seed=lan', 'USER', 'ACTIVE', 3200, null, null, daysAgo(8)],
      [uuidv4(), newUserEmails[1], passwordHash, 'Trần Văn Minh', 'https://api.dicebear.com/7.x/avataaars/svg?seed=minh', 'USER', 'ACTIVE', 7650, null, null, daysAgo(12)],
      [uuidv4(), newUserEmails[2], passwordHash, 'Phạm Thị Nga', 'https://api.dicebear.com/7.x/avataaars/svg?seed=nga', 'USER', 'ACTIVE', 1800, null, null, daysAgo(5)],
      [uuidv4(), newUserEmails[3], passwordHash, 'Lê Văn Phong', 'https://api.dicebear.com/7.x/avataaars/svg?seed=phong', 'USER', 'ACTIVE', 14300, null, null, daysAgo(20)],
      [uuidv4(), newUserEmails[4], passwordHash, 'Hoàng Thị Quỳnh', 'https://api.dicebear.com/7.x/avataaars/svg?seed=quynh', 'USER', 'ACTIVE', 9100, null, null, daysAgo(18)],
      [uuidv4(), newUserEmails[5], passwordHash, 'Đỗ Văn Sơn', 'https://api.dicebear.com/7.x/avataaars/svg?seed=son', 'USER', 'ACTIVE', 4500, null, null, daysAgo(9)],
      [uuidv4(), newUserEmails[6], passwordHash, 'Bùi Thị Thu', 'https://api.dicebear.com/7.x/avataaars/svg?seed=thu', 'USER', 'ACTIVE', 22000, null, null, daysAgo(25)],
      [uuidv4(), newUserEmails[7], passwordHash, 'Đặng Văn Uyên', 'https://api.dicebear.com/7.x/avataaars/svg?seed=uyen', 'USER', 'ACTIVE', 680, null, null, daysAgo(3)],
      [uuidv4(), newUserEmails[8], passwordHash, 'Vũ Thị Vân', 'https://api.dicebear.com/7.x/avataaars/svg?seed=van', 'USER', 'ACTIVE', 11800, null, null, daysAgo(30)],
      [uuidv4(), newUserEmails[9], passwordHash, 'Mai Văn Xuân', 'https://api.dicebear.com/7.x/avataaars/svg?seed=xuan', 'USER', 'ACTIVE', 5300, null, null, daysAgo(14)],
    ];

    const newUserIds = [];
    for (const u of newUserRows) {
      const res = await client.query(
        `INSERT INTO users (id, email, password_hash, full_name, avatar_url, role, status, points_balance, locked_reason, locked_at, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11) RETURNING id`,
        u
      );
      newUserIds.push(res.rows[0].id);
    }
    console.log(`  ✅ Thêm ${newUserRows.length} users mới`);

    // Tất cả user IDs (cũ + mới)
    const allUserIds = [...userIds, ...newUserIds];

    // ============================================================
    // 2. THÊM PARTNER MỚI (pending)
    // ============================================================
    console.log('🏢 Thêm partner mới...');

    // Tạo UUID ngẫu nhiên để tránh trùng email lần thứ 2+
    const ts = Date.now();
    const email1 = `partner.nature.${ts}@gmail.com`;
    const email2 = `partner.cleanworld.${ts}@gmail.com`;

    const pUser1 = await client.query(
      `INSERT INTO users (id, email, password_hash, full_name, avatar_url, role, status, points_balance, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,'PARTNER','ACTIVE',0,$6,$6) RETURNING id`,
      [uuidv4(), email1, passwordHash, 'Nature Green VN', 'https://api.dicebear.com/7.x/avataaars/svg?seed=nature', daysAgo(7)]
    );
    const pUser2 = await client.query(
      `INSERT INTO users (id, email, password_hash, full_name, avatar_url, role, status, points_balance, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,'PARTNER','ACTIVE',0,$6,$6) RETURNING id`,
      [uuidv4(), email2, passwordHash, 'CleanWorld Việt Nam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=cleanworld', daysAgo(3)]
    );

    const actualPartnerId1 = pUser1.rows[0].id;
    const actualPartnerId2 = pUser2.rows[0].id;

    await client.query(
      `INSERT INTO partner_profiles (id, user_id, organization_name, organization_type, contact_name, contact_phone, contact_email, tax_code, address, approval_status, auto_confirm_checkin, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'PENDING',false,$10,$10)`,
      [uuidv4(), actualPartnerId1, 'Nature Green Vietnam', 'Công ty môi trường', 'Nguyễn Thị Xanh', '0956789012', email1, '0606789012', '34 Ngô Quyền, Hà Nội', daysAgo(7)]
    );
    await client.query(
      `INSERT INTO partner_profiles (id, user_id, organization_name, organization_type, contact_name, contact_phone, contact_email, tax_code, address, approval_status, auto_confirm_checkin, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'PENDING',false,$10,$10)`,
      [uuidv4(), actualPartnerId2, 'CleanWorld Vietnam Corp', 'Doanh nghiệp xã hội', 'Trần Sạch Bóng', '0967890123', email2, '0707890123', '67 Bà Triệu, Hà Nội', daysAgo(3)]
    );
    console.log('  ✅ Thêm 2 partner mới (đang pending)');

    // ============================================================
    // 3. THÊM REWARDS MỚI
    // ============================================================
    console.log('🎁 Thêm rewards mới...');
    const newRewardIds = [uuidv4(), uuidv4(), uuidv4(), uuidv4(), uuidv4()];
    const partnerProfile0 = partnerProfileIds[0] || newPartnerProfileId1;
    const partnerProfile2 = partnerProfileIds[2] || partnerProfileIds[0];
    const partnerProfile3 = partnerProfileIds[3] || partnerProfileIds[0];

    const newRewards = [
      [newRewardIds[0], 'Xà Phòng Handmade Thiên Nhiên', 'Xà phòng làm tay từ nguyên liệu tự nhiên, không hóa chất độc hại, bảo vệ da và môi trường', 'https://images.unsplash.com/photo-1556909172-89cf0b13be08?w=400', 300, 200, 'ACTIVE', partnerProfile2, daysAgo(10)],
      [newRewardIds[1], 'Bàn Chải Tre', 'Bàn chải đánh răng cán tre tự nhiên, lông mềm, phân hủy sinh học 100%', 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400', 150, 400, 'ACTIVE', partnerProfile2, daysAgo(8)],
      [newRewardIds[2], 'Khăn Bông Tái Chế', 'Khăn mặt làm từ sợi bông tái chế, mềm mại, siêu thấm, kích thước 40x60cm', 'https://images.unsplash.com/photo-1559131583-4b41a55af7d3?w=400', 450, 150, 'ACTIVE', partnerProfile3, daysAgo(7)],
      [newRewardIds[3], 'Lịch Tái Chế 2027', 'Lịch để bàn in trên giấy tái chế, thiết kế eco-friendly với thông điệp bảo vệ môi trường', 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400', 250, 100, 'ACTIVE', partnerProfile0, daysAgo(5)],
      [newRewardIds[4], 'Voucher Siêu Thị Xanh 200k', 'Voucher mua sắm tại hệ thống siêu thị xanh, ưu tiên sản phẩm hữu cơ và thân thiện môi trường', 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=400', 1800, 30, 'ACTIVE', partnerProfile0, daysAgo(4)],
    ];
    for (const r of newRewards) {
      await client.query(
        `INSERT INTO rewards (id, name, description, thumbnail_url, points_cost, stock, status, partner_profile_id, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$9)`,
        r
      );
    }
    console.log(`  ✅ Thêm ${newRewards.length} rewards mới`);

    // ============================================================
    // 4. THÊM DROPOFF TRANSACTIONS (nhiều hơn)
    // ============================================================
    console.log('🗑️  Thêm dropoff transactions...');

    // Tạo nhiều giao dịch trong 30 ngày qua
    const dropoffEntries = [];

    // Dữ liệu cố định với user và location hiện có
    const fixedDropoffs = [];

    if (locationIds.length >= 3 && allUserIds.length >= 5) {
      // Giao dịch 30 ngày qua cho users hiện có
      const usersForDropoff = allUserIds.slice(0, Math.min(allUserIds.length, 15));
      const locsForDropoff = locationIds.slice(0, Math.min(locationIds.length, 7));
      const partnerUsersForVerify = partnerIds.slice(0, Math.min(partnerIds.length, 3));

      // Tạo giao dịch đa dạng trong 30 ngày
      const dropoffSchedule = [
        // [daysAgo, userId_idx, loc_idx, qty, points]
        [29, 0, 0, 3.5, 350], [28, 1, 1, 2.8, 280], [27, 2, 2, 5.0, 500],
        [26, 3, 0, 1.9, 190], [25, 4, 1, 6.5, 650], [24, 0, 2, 2.1, 210],
        [23, 5, 0, 4.0, 400], [22, 6, 1, 1.5, 150], [21, 7, 0, 7.2, 720],
        [20, 1, 2, 3.3, 330], [19, 2, 0, 4.8, 480], [18, 8, 1, 2.6, 260],
        [17, 3, 2, 3.1, 310], [16, 4, 0, 8.0, 800], [15, 9, 1, 1.8, 180],
        [14, 5, 2, 2.9, 290], [13, 0, 0, 4.5, 450], [12, 6, 1, 3.7, 370],
        [11, 1, 2, 5.5, 550], [10, 7, 0, 2.4, 240], [9, 2, 1, 6.8, 680],
        [8, 3, 0, 1.7, 170],  [7, 4, 2, 9.0, 900],  [6, 8, 0, 3.2, 320],
        [5, 5, 1, 4.1, 410],  [4, 9, 2, 2.2, 220],  [3, 0, 0, 5.8, 580],
        [2, 1, 1, 3.9, 390],  [1, 2, 0, 4.4, 440],
        // Thêm giao dịch pending hôm nay
        [0, 3, 1, 2.0, null], [0, 4, 0, 3.5, null], [0, 5, 2, 1.8, null],
      ];

      for (const [days, uIdx, lIdx, qty, pts] of dropoffSchedule) {
        const userId = usersForDropoff[uIdx % usersForDropoff.length];
        const locId = locsForDropoff[lIdx % locsForDropoff.length];
        const verifyBy = pts !== null ? (partnerUsersForVerify[lIdx % partnerUsersForVerify.length] || null) : null;
        const status = pts !== null ? 'VERIFIED' : 'PENDING';
        const confirmedAt = pts !== null ? daysAgo(days) : null;
        const ts = days === 0 ? hoursAgo(Math.floor(Math.random() * 8) + 1) : daysAgo(days);

        fixedDropoffs.push([
          uuidv4(), userId, locId, verifyBy, qty, 'kg',
          10.0 + Math.random() * 0.1, 106.0 + Math.random() * 0.1,
          parseFloat((Math.random() * 0.5 + 0.02).toFixed(3)),
          pts, status, confirmedAt, ts
        ]);
      }
    }

    for (const d of fixedDropoffs) {
      await client.query(
        `INSERT INTO dropoff_transactions (id, user_id, location_id, verified_by, quantity_value, quantity_unit, user_latitude, user_longitude, distance_km, points_awarded, status, confirmed_at, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$13)`,
        d
      );
    }
    console.log(`  ✅ Thêm ${fixedDropoffs.length} dropoff transactions`);

    // ============================================================
    // 5. THÊM POINT TRANSACTIONS CHO USERS MỚI
    // ============================================================
    console.log('💰 Thêm point transactions...');
    const pointTxToAdd = [];

    // Point transactions cho users mới
    const newUserData = [
      { uid: newUserIds[0], name: 'Lan', pts: 3200 },
      { uid: newUserIds[1], name: 'Minh', pts: 7650 },
      { uid: newUserIds[2], name: 'Nga', pts: 1800 },
      { uid: newUserIds[3], name: 'Phong', pts: 14300 },
      { uid: newUserIds[4], name: 'Quỳnh', pts: 9100 },
      { uid: newUserIds[5], name: 'Sơn', pts: 4500 },
      { uid: newUserIds[6], name: 'Thu', pts: 22000 },
      { uid: newUserIds[7], name: 'Uyên', pts: 680 },
      { uid: newUserIds[8], name: 'Vân', pts: 11800 },
      { uid: newUserIds[9], name: 'Xuân', pts: 5300 },
    ];

    for (const { uid, name, pts } of newUserData) {
      if (pts <= 0) continue;
      let balance = 0;
      const txCount = Math.ceil(pts / 500);
      const step = Math.floor(pts / txCount);

      for (let i = 0; i < txCount; i++) {
        const earned = i === txCount - 1 ? pts - balance : step;
        balance += earned;
        const source = i % 3 === 0 ? 'DROPOFF_TRANSACTION' : i % 3 === 1 ? 'QUIZ' : 'TRASH_CLASSIFICATION';
        const type_name = source === 'DROPOFF_TRANSACTION' ? 'Nộp rác' : source === 'QUIZ' ? 'Quiz' : 'Phân loại AI';
        pointTxToAdd.push([
          uid, 'EARN', earned, balance,
          source === 'DROPOFF_TRANSACTION' ? 'DROPOFF' : source === 'QUIZ' ? 'QUIZ' : 'AI_CLASSIFY',
          source,
          `${type_name} - tích lũy điểm`,
          daysAgo(Math.floor(Math.random() * 30) + 1)
        ]);
      }
    }

    // Thêm một số giao dịch EARN gần đây cho users hiện có (tạo hoạt động mới)
    const recentEarns = [
      [allUserIds[0], 'EARN', 300, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 3kg rác hôm nay', hoursAgo(5)],
      [allUserIds[1], 'EARN', 250, 'QUIZ', 'QUIZ', 'Hoàn thành quiz hôm nay', hoursAgo(3)],
      [allUserIds[2], 'EARN', 420, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 4.2kg rác hôm nay', hoursAgo(4)],
      [allUserIds[3], 'EARN', 180, 'TRASH_CLASSIFICATION', 'TRASH_CLASSIFICATION', 'Phân loại AI hôm nay', hoursAgo(2)],
      [allUserIds[4], 'EARN', 550, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 5.5kg rác hôm nay', hoursAgo(6)],
      [allUserIds[5], 'EARN', 100, 'QUIZ', 'QUIZ', 'Quiz hàng ngày', hoursAgo(1)],
      [allUserIds[6], 'EARN', 75, 'QUIZ', 'QUIZ', 'Quiz lần đầu tiên', hoursAgo(7)],
    ];

    for (const e of recentEarns) {
      pointTxToAdd.push([e[0], e[1], e[2], e[2], e[3], e[4], e[5], e[6]]);
    }

    for (const pt of pointTxToAdd) {
      await client.query(
        `INSERT INTO point_transactions (id, user_id, type, points, balance_after, reason_code, source_type, note, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [uuidv4(), ...pt]
      );
    }
    console.log(`  ✅ Thêm ${pointTxToAdd.length} point transactions`);

    // ============================================================
    // 6. THÊM REDEMPTIONS MỚI
    // ============================================================
    console.log('🎫 Thêm redemptions...');
    const newRedemptions = [];

    if (allUserIds.length >= 3 && rewardIds.length >= 3) {
      const allRewardIds = [...rewardIds, ...newRewardIds];
      newRedemptions.push(
        [allUserIds[0], allRewardIds[0], 500, 'PENDING', hoursAgo(3)],
        [allUserIds[1], allRewardIds[1], 300, 'PENDING', hoursAgo(5)],
        [allUserIds[2], allRewardIds[2], 800, 'APPROVED', daysAgo(1)],
        [newUserIds[0], newRewardIds[0], 300, 'FULFILLED', daysAgo(4)],
        [newUserIds[1], newRewardIds[1], 150, 'FULFILLED', daysAgo(6)],
        [newUserIds[3], newRewardIds[2], 450, 'PENDING', hoursAgo(2)],
        [newUserIds[4], newRewardIds[3], 250, 'FULFILLED', daysAgo(3)],
        [newUserIds[5], newRewardIds[4], 1800, 'PENDING', hoursAgo(8)],
        [newUserIds[6], allRewardIds[0], 500, 'FULFILLED', daysAgo(10)],
        [newUserIds[8], allRewardIds[2], 800, 'APPROVED', daysAgo(2)],
      );
    }

    for (const rd of newRedemptions) {
      await client.query(
        `INSERT INTO redemptions (id, user_id, reward_id, points_spent, status, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$6)`,
        [uuidv4(), ...rd]
      );
    }
    console.log(`  ✅ Thêm ${newRedemptions.length} redemptions`);

    // ============================================================
    // 7. THÊM QUIZ QUESTIONS MỚI
    // ============================================================
    console.log('❓ Thêm quiz questions...');
    const newQuestions = [
      [uuidv4(), 'Phân loại rác', 'medium', 'Giày dép cũ nên được xử lý như thế nào?', 'Giày dép cũ có thể được quyên góp cho người nghèo nếu còn sử dụng được, hoặc gửi đến các cơ sở tái chế giày chuyên dụng.', 'ACTIVE', 'MANUAL', adminId, adminId, daysAgo(3)],
      [uuidv4(), 'Năng lượng tái tạo', 'medium', 'Năng lượng gió tạo ra bao nhiêu phần trăm điện toàn cầu hiện nay?', 'Năng lượng gió hiện chiếm khoảng 7-8% tổng sản lượng điện toàn cầu và đang tăng trưởng nhanh.', 'ACTIVE', 'MANUAL', adminId, adminId, daysAgo(3)],
      [uuidv4(), 'Ô nhiễm nhựa', 'hard', 'Mỗi năm có bao nhiêu tấn rác nhựa đổ ra đại dương?', 'Ước tính khoảng 8-12 triệu tấn rác nhựa đổ ra đại dương mỗi năm, gây hại cho hệ sinh thái biển và chuỗi thực phẩm.', 'ACTIVE', 'AI', adminId, adminId, daysAgo(2)],
      [uuidv4(), 'Thói quen xanh', 'easy', 'Tắt điện khi ra khỏi phòng có thể tiết kiệm bao nhiêu điện?', 'Thói quen tắt đèn và thiết bị điện khi không sử dụng có thể giúp giảm 10-15% hóa đơn điện hàng tháng.', 'ACTIVE', 'MANUAL', adminId, adminId, daysAgo(2)],
      [uuidv4(), 'Carbon footprint', 'hard', 'Phương tiện giao thông nào có lượng khí thải CO2 thấp nhất trên mỗi km/người?', 'Xe đạp hoặc đi bộ có lượng khí thải CO2 thấp nhất (gần bằng 0). Trong phương tiện cơ giới, tàu điện và xe buýt điện là thân thiện nhất.', 'ACTIVE', 'MANUAL', adminId, adminId, daysAgo(1)],
      [uuidv4(), 'Rừng và môi trường', 'medium', 'Một cây xanh trưởng thành hấp thụ bao nhiêu kg CO2 mỗi năm?', 'Một cây xanh trưởng thành có thể hấp thụ trung bình 21-22 kg CO2 mỗi năm thông qua quá trình quang hợp.', 'ACTIVE', 'MANUAL', adminId, adminId, daysAgo(1)],
      [uuidv4(), 'EcoHabit', 'easy', 'Tính năng phân loại rác AI của EcoHabit sử dụng công nghệ gì?', 'Tính năng phân loại rác của EcoHabit sử dụng mô hình học sâu (Deep Learning) để nhận diện và phân loại rác thải qua ảnh chụp từ camera điện thoại.', 'ACTIVE', 'MANUAL', adminId, adminId, hoursAgo(12)],
      [uuidv4(), 'Nước sạch', 'medium', 'Người Việt Nam trung bình sử dụng bao nhiêu lít nước mỗi ngày?', 'Người Việt Nam trung bình sử dụng khoảng 100-150 lít nước sạch mỗi ngày cho sinh hoạt, cao hơn mức trung bình toàn cầu.', 'ACTIVE', 'AI', adminId, adminId, hoursAgo(6)],
    ];

    const newQuestionIds = [];
    for (const q of newQuestions) {
      const [id, topic, diff, content, expl, status, source, createdById, reviewedById, reviewedAt] = q;
      const createdAt = reviewedAt || new Date().toISOString();
      await client.query(
        `INSERT INTO quiz_questions (id, topic, difficulty, content, explanation, status, source, created_by_id, reviewed_by_id, reviewed_at, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())`,
        [id, topic, diff, content, expl, status, source, createdById, reviewedById, reviewedAt, createdAt]
      );
      newQuestionIds.push(id);
    }
    console.log(`  ✅ Thêm ${newQuestions.length} quiz questions`);

    // ============================================================
    // 8. THÊM OPTIONS CHO QUIZ QUESTIONS MỚI
    // ============================================================
    console.log('📝 Thêm quiz options...');
    const newOptions = [
      // Q1: Giày dép
      [newQuestionIds[0], 'Bỏ vào thùng rác thông thường', false, 1],
      [newQuestionIds[0], 'Quyên góp hoặc gửi đến cơ sở tái chế chuyên dụng', true, 2],
      [newQuestionIds[0], 'Đốt để tiêu hủy', false, 3],
      [newQuestionIds[0], 'Chôn xuống đất', false, 4],
      // Q2: Năng lượng gió
      [newQuestionIds[1], '1-2%', false, 1],
      [newQuestionIds[1], '7-8%', true, 2],
      [newQuestionIds[1], '25-30%', false, 3],
      [newQuestionIds[1], '50%', false, 4],
      // Q3: Rác nhựa đại dương
      [newQuestionIds[2], '100.000 tấn', false, 1],
      [newQuestionIds[2], '1 triệu tấn', false, 2],
      [newQuestionIds[2], '8-12 triệu tấn', true, 3],
      [newQuestionIds[2], '100 triệu tấn', false, 4],
      // Q4: Tiết kiệm điện
      [newQuestionIds[3], '1-2%', false, 1],
      [newQuestionIds[3], '10-15%', true, 2],
      [newQuestionIds[3], '50%', false, 3],
      [newQuestionIds[3], 'Không đáng kể', false, 4],
      // Q5: CO2 thấp nhất
      [newQuestionIds[4], 'Xe ô tô điện', false, 1],
      [newQuestionIds[4], 'Xe máy xăng', false, 2],
      [newQuestionIds[4], 'Xe đạp hoặc phương tiện công cộng điện', true, 3],
      [newQuestionIds[4], 'Xe buýt xăng', false, 4],
      // Q6: Cây hấp thụ CO2
      [newQuestionIds[5], '5 kg/năm', false, 1],
      [newQuestionIds[5], '21-22 kg/năm', true, 2],
      [newQuestionIds[5], '100 kg/năm', false, 3],
      [newQuestionIds[5], '500 kg/năm', false, 4],
      // Q7: AI phân loại rác
      [newQuestionIds[6], 'Quét mã vạch', false, 1],
      [newQuestionIds[6], 'Học sâu (Deep Learning) nhận diện qua ảnh', true, 2],
      [newQuestionIds[6], 'Tra cứu từ điển rác thải', false, 3],
      [newQuestionIds[6], 'GPS định vị thùng rác gần nhất', false, 4],
      // Q8: Nước sinh hoạt
      [newQuestionIds[7], '30-50 lít', false, 1],
      [newQuestionIds[7], '100-150 lít', true, 2],
      [newQuestionIds[7], '300-500 lít', false, 3],
      [newQuestionIds[7], '1000 lít', false, 4],
    ];
    for (const opt of newOptions) {
      await client.query(
        `INSERT INTO quiz_options (id, question_id, content, is_correct, sort_order) VALUES ($1,$2,$3,$4,$5)`,
        [uuidv4(), ...opt]
      );
    }
    console.log(`  ✅ Thêm ${newOptions.length} quiz options`);

    // ============================================================
    // COMMIT
    // ============================================================
    await client.query('COMMIT');

    // Thống kê tổng kết
    const stats = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM partner_profiles) as partners,
        (SELECT COUNT(*) FROM locations) as locations,
        (SELECT COUNT(*) FROM rewards) as rewards,
        (SELECT COUNT(*) FROM dropoff_transactions) as dropoffs,
        (SELECT COUNT(*) FROM redemptions) as redemptions,
        (SELECT COUNT(*) FROM quiz_questions) as questions,
        (SELECT COUNT(*) FROM point_transactions) as point_txs,
        (SELECT COUNT(*) FROM dropoff_transactions WHERE status = 'PENDING') as pending_dropoffs,
        (SELECT COUNT(*) FROM redemptions WHERE status = 'PENDING') as pending_redemptions
    `);
    const s = stats.rows[0];

    console.log('\n🎉 ============================================');
    console.log('   THÊM DỮ LIỆU HOÀN TẤT!');
    console.log('=============================================');
    console.log(`   👥 Tổng Users:              ${s.users}`);
    console.log(`   🏢 Tổng Partners:            ${s.partners}`);
    console.log(`   📍 Tổng Locations:           ${s.locations}`);
    console.log(`   🎁 Tổng Rewards:             ${s.rewards}`);
    console.log(`   🗑️  Tổng Dropoffs:            ${s.dropoffs} (${s.pending_dropoffs} đang pending)`);
    console.log(`   🎫 Tổng Redemptions:         ${s.redemptions} (${s.pending_redemptions} đang pending)`);
    console.log(`   ❓ Tổng Quiz Questions:      ${s.questions}`);
    console.log(`   💰 Tổng Point Transactions:  ${s.point_txs}`);
    console.log('=============================================\n');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Lỗi:', err.message);
    if (err.detail) console.error('   Detail:', err.detail);
    throw err;
  } finally {
    await client.end();
  }
}

addData().catch(console.error);
