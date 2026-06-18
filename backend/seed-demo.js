/**
 * EcoHabit Demo Data Seeder
 * Chạy: node seed-demo.js
 * 
 * Script này seed toàn bộ dữ liệu demo cho hệ thống EcoHabit
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

// Helper để tạo timestamp lùi về quá khứ
function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

async function seed() {
  await client.connect();
  console.log('✅ Đã kết nối database');

  try {
    // Bắt đầu transaction
    await client.query('BEGIN');

    // ============================================================
    // CLEAR DATA (theo thứ tự FK)
    // ============================================================
    console.log('🗑️  Đang xóa dữ liệu cũ...');
    const tables = [
      'quiz_attempt_answers', 'quiz_attempts',
      'daily_quiz_set_questions', 'daily_quiz_sets',
      'quiz_options', 'quiz_questions',
      'redemptions', 'reward_pickup_options', 'rewards',
      'dropoff_transactions', 'accepted_waste_types',
      'location_capabilities', 'collection_location_profiles', 'locations',
      'point_transactions', 'partner_role_types', 'partner_profiles',
      'users'
    ];
    for (const table of tables) {
      await client.query(`TRUNCATE TABLE ${table} CASCADE`);
    }
    console.log('✅ Đã xóa dữ liệu cũ');

    // ============================================================
    // PASSWORD HASH
    // ============================================================
    const passwordHash = await bcrypt.hash('Password123!', 10);

    // ============================================================
    // 1. USERS
    // ============================================================
    console.log('👥 Tạo users...');
    const adminId = 'a0000000-0000-0000-0000-000000000001';
    const partnerIds = [1,2,3,4,5].map(i => `a1000000-0000-0000-0000-00000000000${i}`);
    const userIds = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(i => 
      `a2000000-0000-0000-0000-0000000000${String(i).padStart(2, '0')}`
    );

    const users = [
      // Admin
      [adminId, 'admin@ecohabit.vn', passwordHash, 'Quản Trị Viên EcoHabit', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 'ADMIN', 'ACTIVE', 0, null, null, daysAgo(180)],
      // Partners
      [partnerIds[0], 'partner.xanh@gmail.com', passwordHash, 'Công Ty Xanh Sạch', 'https://api.dicebear.com/7.x/avataaars/svg?seed=partner1', 'PARTNER', 'ACTIVE', 0, null, null, daysAgo(150)],
      [partnerIds[1], 'partner.moitruong@gmail.com', passwordHash, 'Trung Tâm Môi Trường Xanh', 'https://api.dicebear.com/7.x/avataaars/svg?seed=partner2', 'PARTNER', 'ACTIVE', 0, null, null, daysAgo(120)],
      [partnerIds[2], 'partner.recycle@gmail.com', passwordHash, 'Tái Chế Việt Nam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=partner3', 'PARTNER', 'ACTIVE', 0, null, null, daysAgo(90)],
      [partnerIds[3], 'partner.ecostore@gmail.com', passwordHash, 'EcoStore Hà Nội', 'https://api.dicebear.com/7.x/avataaars/svg?seed=partner4', 'PARTNER', 'ACTIVE', 0, null, null, daysAgo(60)],
      [partnerIds[4], 'partner.greencafe@gmail.com', passwordHash, 'Green Cafe & Rewards', 'https://api.dicebear.com/7.x/avataaars/svg?seed=partner5', 'PARTNER', 'ACTIVE', 0, null, null, daysAgo(45)],
      // Regular Users
      [userIds[0], 'nguyen.van.an@gmail.com', passwordHash, 'Nguyễn Văn An', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1', 'USER', 'ACTIVE', 4250, null, null, daysAgo(160)],
      [userIds[1], 'tran.thi.bich@gmail.com', passwordHash, 'Trần Thị Bích', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2', 'USER', 'ACTIVE', 8900, null, null, daysAgo(145)],
      [userIds[2], 'le.minh.cuong@gmail.com', passwordHash, 'Lê Minh Cường', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3', 'USER', 'ACTIVE', 12600, null, null, daysAgo(130)],
      [userIds[3], 'pham.thi.dung@gmail.com', passwordHash, 'Phạm Thị Dung', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user4', 'USER', 'ACTIVE', 3100, null, null, daysAgo(115)],
      [userIds[4], 'caongatcv987@gmail.com', passwordHash, 'Hoàng Văn Em', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user5', 'USER', 'ACTIVE', 21500, null, null, daysAgo(100)],
      [userIds[5], 'vu.thi.phuong@gmail.com', passwordHash, 'Vũ Thị Phương', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user6', 'USER', 'ACTIVE', 7800, null, null, daysAgo(90)],
      [userIds[6], 'do.van.giang@gmail.com', passwordHash, 'Đỗ Văn Giang', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user7', 'USER', 'ACTIVE', 550, null, null, daysAgo(75)],
      [userIds[7], 'bui.thi.hoa@gmail.com', passwordHash, 'Bùi Thị Hoa', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user8', 'USER', 'ACTIVE', 16200, null, null, daysAgo(60)],
      [userIds[8], 'dang.minh.hung@gmail.com', passwordHash, 'Đặng Minh Hùng', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user9', 'USER', 'ACTIVE', 9300, null, null, daysAgo(50)],
      [userIds[9], 'ly.thi.kim@gmail.com', passwordHash, 'Lý Thị Kim', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user10', 'USER', 'ACTIVE', 5600, null, null, daysAgo(40)],
      [userIds[10], 'nguyen.minh.long@gmail.com', passwordHash, 'Nguyễn Minh Long', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user11', 'USER', 'ACTIVE', 18750, null, null, daysAgo(35)],
      [userIds[11], 'tran.thi.mai@gmail.com', passwordHash, 'Trần Thị Mai', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user12', 'USER', 'ACTIVE', 2400, null, null, daysAgo(28)],
      [userIds[12], 'phan.van.nam@gmail.com', passwordHash, 'Phan Văn Nam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user13', 'USER', 'ACTIVE', 6750, null, null, daysAgo(20)],
      [userIds[13], 'vo.thi.oanh@gmail.com', passwordHash, 'Võ Thị Oanh', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user14', 'USER', 'ACTIVE', 11300, null, null, daysAgo(15)],
      [userIds[14], 'mai.van.phuc@gmail.com', passwordHash, 'Mai Văn Phúc', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user15', 'USER', 'ACTIVE', 1200, null, null, daysAgo(10)],
      [userIds[15], 'user.banned@gmail.com', passwordHash, 'Tài Khoản Bị Cấm', null, 'USER', 'BANNED', 0, 'Vi phạm nghiêm trọng điều khoản dịch vụ', daysAgo(40), daysAgo(50)],
      [userIds[16], 'spam.user@gmail.com', passwordHash, 'Tài Khoản Vi Phạm', null, 'USER', 'LOCKED', 0, 'Vi phạm chính sách cộng đồng - spam báo cáo sai', daysAgo(25), daysAgo(30)],
    ];

    for (const u of users) {
      await client.query(
        `INSERT INTO users (id, email, password_hash, full_name, avatar_url, role, status, points_balance, locked_reason, locked_at, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11)`,
        u
      );
    }
    console.log(`  ✅ Tạo ${users.length} users`);

    // ============================================================
    // 2. PARTNER PROFILES
    // ============================================================
    console.log('🏢 Tạo partner profiles...');
    const partnerProfileIds = [1,2,3,4,5].map(i => `a3000000-0000-0000-0000-00000000000${i}`);
    
    const partnerProfiles = [
      [partnerProfileIds[0], partnerIds[0], 'Công Ty TNHH Xanh Sạch', 'Công ty thu gom rác thải', 'Nguyễn Thành Tâm', '0901234567', 'partner.xanh@gmail.com', '0101234567', '123 Lê Duẩn, Hà Nội', 'APPROVED', true, adminId, daysAgo(140), daysAgo(150)],
      [partnerProfileIds[1], partnerIds[1], 'Trung Tâm Môi Trường Xanh', 'Tổ chức phi lợi nhuận', 'Trần Văn Bình', '0912345678', 'partner.moitruong@gmail.com', '0202345678', '456 Nguyễn Huệ, Hà Nội', 'APPROVED', false, adminId, daysAgo(110), daysAgo(120)],
      [partnerProfileIds[2], partnerIds[2], 'Tái Chế Việt Nam JSC', 'Công ty cổ phần', 'Lê Thị Châu', '0923456789', 'partner.recycle@gmail.com', '0303456789', '789 Hoàng Diệu, Đà Nẵng', 'APPROVED', true, adminId, daysAgo(80), daysAgo(90)],
      [partnerProfileIds[3], partnerIds[3], 'EcoStore Hà Nội', 'Cửa hàng xanh', 'Phạm Minh Đức', '0934567890', 'partner.ecostore@gmail.com', '0404567890', '12 Đinh Tiên Hoàng, Hà Nội', 'APPROVED', false, adminId, daysAgo(50), daysAgo(60)],
      [partnerProfileIds[4], partnerIds[4], 'Green Cafe & Rewards', 'Nhà hàng/Cafe thân thiện môi trường', 'Hoàng Thu Hương', '0945678901', 'partner.greencafe@gmail.com', '0505678901', '88 Tràng Tiền, Hà Nội', 'PENDING', false, null, null, daysAgo(45)],
    ];

    for (const p of partnerProfiles) {
      await client.query(
        `INSERT INTO partner_profiles (id, user_id, organization_name, organization_type, contact_name, contact_phone, contact_email, tax_code, address, approval_status, auto_confirm_checkin, approved_by, approved_at, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$14)`,
        p
      );
    }
    console.log(`  ✅ Tạo ${partnerProfiles.length} partner profiles`);

    // ============================================================
    // 3. PARTNER ROLE TYPES
    // ============================================================
    console.log('🎭 Tạo partner role types...');
    const roleTypes = [
      [uuidv4(), partnerProfileIds[0], 'COLLECTOR', true, daysAgo(150)],
      [uuidv4(), partnerProfileIds[1], 'COLLECTOR', true, daysAgo(120)],
      [uuidv4(), partnerProfileIds[2], 'COLLECTOR', true, daysAgo(90)],
      [uuidv4(), partnerProfileIds[2], 'REWARD_PROVIDER', true, daysAgo(90)],
      [uuidv4(), partnerProfileIds[3], 'REWARD_PROVIDER', true, daysAgo(60)],
      [uuidv4(), partnerProfileIds[4], 'REWARD_PROVIDER', true, daysAgo(45)],
    ];
    for (const r of roleTypes) {
      await client.query(
        `INSERT INTO partner_role_types (id, partner_profile_id, role_type, is_active, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$5)`,
        r
      );
    }
    console.log(`  ✅ Tạo ${roleTypes.length} partner role types`);

    // ============================================================
    // 4. LOCATIONS
    // ============================================================
    console.log('📍 Tạo locations...');
    const locationIds = [1,2,3,4,5,6,7,8,9,10,11].map(i => `a4000000-0000-0000-0000-0000000000${String(i).padStart(2, '0')}`);
    
    const locations = [
      // Partner 1 - Xanh Sạch (Hà Nội)
      [locationIds[0], partnerIds[0], adminId, 'Điểm Thu Gom Hoàn Kiếm', '35 Lý Thái Tổ, Hoàn Kiếm, Hà Nội', '0901234567', 21.0285, 105.8542, 'APPROVED', partnerProfileIds[0], daysAgo(140)],
      [locationIds[1], partnerIds[0], adminId, 'Điểm Thu Gom Đống Đa', '72 Tôn Đức Thắng, Đống Đa, Hà Nội', '0901234567', 21.0245, 105.8432, 'APPROVED', partnerProfileIds[0], daysAgo(130)],
      [locationIds[2], partnerIds[0], adminId, 'Điểm Thu Gom Cầu Giấy', '144 Xuân Thủy, Cầu Giấy, Hà Nội', '0901234567', 21.0378, 105.7894, 'APPROVED', partnerProfileIds[0], daysAgo(120)],
      // Partner 2 - Môi Trường Xanh
      [locationIds[3], partnerIds[1], adminId, 'Trạm Tái Chế Bách Khoa', 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội', '0912345678', 21.0056, 105.8412, 'APPROVED', partnerProfileIds[1], daysAgo(110)],
      [locationIds[4], partnerIds[1], adminId, 'Trạm Tái Chế Thanh Xuân', '108 Nguyễn Trãi, Thanh Xuân, Hà Nội', '0912345678', 20.9965, 105.8234, 'APPROVED', partnerProfileIds[1], daysAgo(100)],
      // Partner 3 - Tái Chế VN (Đà Nẵng)
      [locationIds[5], partnerIds[2], adminId, 'Trung Tâm Tái Chế Đà Nẵng', '200 Lê Duẩn, Hải Châu, Đà Nẵng', '0923456789', 16.0748, 108.2208, 'APPROVED', partnerProfileIds[2], daysAgo(85)],
      [locationIds[6], partnerIds[2], adminId, 'Điểm Thu Gom Sơn Trà', '15 Ngô Quyền, Sơn Trà, Đà Nẵng', '0923456789', 16.0878, 108.2481, 'APPROVED', partnerProfileIds[2], daysAgo(75)],
      // Locations đang chờ duyệt (user tự báo)
      [locationIds[7], userIds[0], null, 'Điểm Thu Gom Tự Báo Long Biên', '55 Ngô Gia Tự, Long Biên, Hà Nội', '0987654321', 21.0512, 105.8923, 'PENDING', null, daysAgo(5)],
      [locationIds[8], userIds[2], null, 'Thùng Rác Tái Chế Khu Dân Cư Ba Đình', '99 Trần Phú, Ba Đình, Hà Nội', '0976543210', 21.0354, 105.8421, 'PENDING', null, daysAgo(2)],
      // Partner 4 - EcoStore (cả collect lẫn pickup reward)
      [locationIds[9], partnerIds[3], adminId, 'EcoStore - Chi Nhánh Hoàn Kiếm', '12 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội', '0934567890', 21.0285, 105.8534, 'APPROVED', partnerProfileIds[3], daysAgo(50)],
      [locationIds[10], partnerIds[3], adminId, 'EcoStore - Chi Nhánh Cầu Giấy', '56 Trần Thái Tông, Cầu Giấy, Hà Nội', '0934567890', 21.0398, 105.7812, 'APPROVED', partnerProfileIds[3], daysAgo(45)],
    ];

    for (const loc of locations) {
      await client.query(
        `INSERT INTO locations (id, created_by, verified_by, name, address, contact_phone, latitude, longitude, status, partner_profile_id, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11)`,
        loc
      );
    }
    console.log(`  ✅ Tạo ${locations.length} locations`);

    // ============================================================
    // 5. ACCEPTED WASTE TYPES
    // ============================================================
    console.log('♻️  Tạo accepted waste types...');
    const wasteTypesData = [
      [locationIds[0], 'PLASTIC', 'Chai nhựa, túi nhựa sạch, không lẫn thức ăn'],
      [locationIds[0], 'PAPER', 'Giấy báo, bìa carton, sách cũ'],
      [locationIds[0], 'GLASS', 'Chai thủy tinh, lọ thủy tinh'],
      [locationIds[1], 'PLASTIC', 'Tất cả loại nhựa có mã tái chế 1-7'],
      [locationIds[1], 'METAL', 'Lon kim loại, đồng, nhôm phế liệu'],
      [locationIds[1], 'BATTERY', 'Pin AA, AAA, pin điện thoại cũ'],
      [locationIds[2], 'E_WASTE', 'Điện thoại cũ, máy tính, thiết bị điện tử'],
      [locationIds[2], 'BATTERY', 'Pin lithium, pin laptop'],
      [locationIds[2], 'METAL', 'Nhôm, đồng, sắt phế liệu'],
      [locationIds[3], 'PLASTIC', 'Nhựa cứng, nhựa mềm'],
      [locationIds[3], 'PAPER', 'Giấy, bìa, sách báo'],
      [locationIds[3], 'TEXTILE', 'Quần áo cũ còn sử dụng được'],
      [locationIds[4], 'PLASTIC', 'Chai lọ nhựa PET'],
      [locationIds[4], 'GLASS', 'Thủy tinh trong, không vỡ vụn'],
      [locationIds[4], 'TEXTILE', 'Vải, quần áo cũ'],
      [locationIds[5], 'PLASTIC', 'Tất cả loại nhựa'],
      [locationIds[5], 'METAL', 'Kim loại phế liệu các loại'],
      [locationIds[5], 'E_WASTE', 'Thiết bị điện tử cũ'],
      [locationIds[5], 'BATTERY', 'Pin các loại'],
      [locationIds[6], 'PLASTIC', 'Chai nhựa, hộp nhựa'],
      [locationIds[6], 'PAPER', 'Giấy, carton'],
      [locationIds[9], 'PLASTIC', 'Chai nhựa, túi nhựa'],
      [locationIds[9], 'BATTERY', 'Pin tiểu, pin sạc'],
      [locationIds[10], 'PLASTIC', 'Nhựa các loại'],
      [locationIds[10], 'PAPER', 'Giấy, bìa'],
    ];
    for (const wt of wasteTypesData) {
      await client.query(
        `INSERT INTO accepted_waste_types (id, location_id, waste_type, condition_note) VALUES ($1,$2,$3,$4)`,
        [uuidv4(), ...wt]
      );
    }
    console.log(`  ✅ Tạo ${wasteTypesData.length} accepted waste types`);

    // ============================================================
    // 6. LOCATION CAPABILITIES
    // ============================================================
    console.log('⚙️  Tạo location capabilities...');
    const capabilities = [
      [locationIds[0], 'COLLECTION'], [locationIds[1], 'COLLECTION'],
      [locationIds[2], 'COLLECTION'], [locationIds[3], 'COLLECTION'],
      [locationIds[4], 'COLLECTION'], [locationIds[5], 'COLLECTION'],
      [locationIds[6], 'COLLECTION'],
      [locationIds[9], 'COLLECTION'], [locationIds[9], 'REWARD_PICKUP'],
      [locationIds[10], 'COLLECTION'], [locationIds[10], 'REWARD_PICKUP'],
    ];
    for (const [locId, cap] of capabilities) {
      await client.query(
        `INSERT INTO location_capabilities (id, location_id, capability, created_at, updated_at) VALUES ($1,$2,$3,NOW(),NOW())`,
        [uuidv4(), locId, cap]
      );
    }
    console.log(`  ✅ Tạo ${capabilities.length} location capabilities`);

    // ============================================================
    // 7. COLLECTION LOCATION PROFILES
    // ============================================================
    console.log('🏪 Tạo collection location profiles...');
    const collectionProfiles = [
      [locationIds[0], 'COUNTER', 'Mang rác đã phân loại đến quầy, nhân viên sẽ cân và xác nhận', true],
      [locationIds[1], 'BIN', 'Bỏ vào thùng phân loại tương ứng. App sẽ tự xác nhận qua QR code', false],
      [locationIds[2], 'MACHINE', 'Đưa rác vào máy tự động, máy sẽ nhận diện và cấp điểm', false],
      [locationIds[3], 'COUNTER', 'Đến quầy nhân viên, xuất trình app để xác nhận', true],
      [locationIds[4], 'BIN', 'Thùng phân loại màu sắc, scan QR để check-in', false],
      [locationIds[5], 'COUNTER', 'Mang đến trung tâm, nhân viên tiếp nhận và xác nhận 24/7', true],
      [locationIds[6], 'BIN', 'Hệ thống thùng thông minh kết nối IoT', false],
      [locationIds[9], 'COUNTER', 'Mang rác đến quầy thu ngân, đổi điểm ngay', true],
      [locationIds[10], 'COUNTER', 'Quầy thu gom cuối cửa hàng, mở 8h-21h', true],
    ];
    for (const [locId, siteType, instructions, requiresStaff] of collectionProfiles) {
      await client.query(
        `INSERT INTO collection_location_profiles (id, location_id, site_type, instructions, requires_staff_confirmation, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,NOW(),NOW())`,
        [uuidv4(), locId, siteType, instructions, requiresStaff]
      );
    }
    console.log(`  ✅ Tạo ${collectionProfiles.length} collection profiles`);

    // ============================================================
    // 8. REWARDS
    // ============================================================
    console.log('🎁 Tạo rewards...');
    const rewardIds = [1,2,3,4,5,6,7,8,9,10,11].map(i => `a5000000-0000-0000-0000-0000000000${String(i).padStart(2,'0')}`);
    
    const rewards = [
      [rewardIds[0], 'Túi Vải EcoStore', 'Túi vải canvas tái chế 100%, in logo EcoHabit. Kích thước 40x35cm, bền đẹp dùng hàng ngày', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 500, 200, 'ACTIVE', partnerProfileIds[3], daysAgo(50)],
      [rewardIds[1], 'Bình Nước Giữ Nhiệt 500ml', 'Bình inox 500ml không BPA, giữ lạnh 24h giữ nóng 12h. Giảm thiểu rác nhựa', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', 1500, 80, 'ACTIVE', partnerProfileIds[3], daysAgo(48)],
      [rewardIds[2], 'Hộp Cơm Bento Tre', 'Hộp đựng thức ăn làm từ tre tự nhiên 100% phân hủy sinh học, 3 ngăn chia', 'https://images.unsplash.com/photo-1564436872-f6d81182df12?w=400', 800, 150, 'ACTIVE', partnerProfileIds[3], daysAgo(45)],
      [rewardIds[3], 'Bộ Ống Hút Inox 6 Cái', 'Ống hút inox tái sử dụng kèm cọ vệ sinh. Thay thế ống hút nhựa dùng 1 lần', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 600, 300, 'ACTIVE', partnerProfileIds[3], daysAgo(42)],
      [rewardIds[4], 'Voucher Cà Phê Green Cafe 50k', 'Voucher uống cà phê tại Green Cafe, áp dụng cho cả menu. Hết hạn 30 ngày', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', 400, 100, 'ACTIVE', partnerProfileIds[4], daysAgo(40)],
      [rewardIds[5], 'Voucher Green Cafe 100k', 'Voucher trị giá 100k dùng cho bữa ăn tại Green Cafe. Đồ ăn organic, bao bì xanh', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', 750, 50, 'ACTIVE', partnerProfileIds[4], daysAgo(38)],
      [rewardIds[6], 'Nón Bảo Hiểm Tái Chế', 'Nón bảo hiểm làm từ nhựa tái chế 70%, đạt chuẩn an toàn Việt Nam', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400', 3000, 30, 'ACTIVE', partnerProfileIds[2], daysAgo(80)],
      [rewardIds[7], 'Chậu Cây Từ Lốp Xe Cũ', 'Chậu cây trang trí độc đáo tái chế từ lốp xe, đường kính 30cm, nhiều màu', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', 1200, 60, 'ACTIVE', partnerProfileIds[2], daysAgo(75)],
      [rewardIds[8], 'Túi Giấy Handmade 5 Cái', 'Bộ 5 túi giấy handmade từ báo tái chế, nhiều kích cỡ, thân thiện môi trường', 'https://images.unsplash.com/photo-1586449480537-3a82b3c9e5f5?w=400', 200, 500, 'ACTIVE', partnerProfileIds[2], daysAgo(70)],
      [rewardIds[9], 'Áo Thun Eco (Hết Hàng)', 'Áo thun cotton hữu cơ 100%, in hình EcoHabit', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 2000, 0, 'INACTIVE', partnerProfileIds[3], daysAgo(50)],
      [rewardIds[10], 'Cây Xanh Mini Để Bàn', 'Cây cảnh mini để bàn, tạo không khí trong lành cho văn phòng', 'https://images.unsplash.com/photo-1509587584298-0f3620e1604b?w=400', 350, 80, 'ACTIVE', partnerProfileIds[2], daysAgo(65)],
    ];
    for (const r of rewards) {
      await client.query(
        `INSERT INTO rewards (id, name, description, thumbnail_url, points_cost, stock, status, partner_profile_id, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$9)`,
        r
      );
    }
    console.log(`  ✅ Tạo ${rewards.length} rewards`);

    // ============================================================
    // 9. REWARD PICKUP OPTIONS
    // ============================================================
    console.log('🚚 Tạo reward pickup options...');
    const pickupOptions = [
      [rewardIds[0], locationIds[9]], [rewardIds[0], locationIds[10]],
      [rewardIds[1], locationIds[9]],
      [rewardIds[2], locationIds[9]], [rewardIds[2], locationIds[10]],
      [rewardIds[3], locationIds[9]], [rewardIds[3], locationIds[10]],
    ];
    for (const [rwId, locId] of pickupOptions) {
      await client.query(
        `INSERT INTO reward_pickup_options (id, reward_id, location_id, created_at, updated_at) VALUES ($1,$2,$3,NOW(),NOW())`,
        [uuidv4(), rwId, locId]
      );
    }
    console.log(`  ✅ Tạo ${pickupOptions.length} pickup options`);

    // ============================================================
    // 10. DROPOFF TRANSACTIONS
    // ============================================================
    console.log('🗑️  Tạo dropoff transactions...');
    const dropoffData = [
      // User 0 - Nguyễn Văn An
      [userIds[0], locationIds[0], partnerIds[0], 2.5, 'kg', 21.0287, 105.8545, 0.03, 250, 'VERIFIED', daysAgo(155), daysAgo(155)],
      [userIds[0], locationIds[1], partnerIds[0], 1.8, 'kg', 21.0247, 105.8435, 0.04, 180, 'VERIFIED', daysAgo(140), daysAgo(140)],
      [userIds[0], locationIds[0], partnerIds[0], 3.2, 'kg', 21.0286, 105.8543, 0.02, 320, 'VERIFIED', daysAgo(120), daysAgo(120)],
      [userIds[0], locationIds[2], null, 1.5, 'kg', 21.0379, 105.7896, 0.05, null, 'PENDING', null, daysAgo(3)],
      // User 1 - Trần Thị Bích
      [userIds[1], locationIds[3], partnerIds[1], 5.0, 'kg', 21.0058, 105.8414, 0.04, 500, 'VERIFIED', daysAgo(140), daysAgo(140)],
      [userIds[1], locationIds[4], partnerIds[1], 4.5, 'kg', 20.9967, 105.8237, 0.05, 450, 'VERIFIED', daysAgo(125), daysAgo(125)],
      [userIds[1], locationIds[3], partnerIds[1], 6.0, 'kg', 21.0059, 105.8413, 0.03, 600, 'VERIFIED', daysAgo(110), daysAgo(110)],
      [userIds[1], locationIds[3], partnerIds[1], 3.8, 'kg', 21.0057, 105.8415, 0.04, 380, 'VERIFIED', daysAgo(90), daysAgo(90)],
      [userIds[1], locationIds[4], partnerIds[1], 2.2, 'kg', 20.9966, 105.8236, 0.04, 220, 'VERIFIED', daysAgo(70), daysAgo(70)],
      [userIds[1], locationIds[3], null, 4.0, 'kg', 21.0060, 105.8416, 0.03, null, 'PENDING', null, daysAgo(1)],
      // User 2 - Lê Minh Cường (Đà Nẵng)
      [userIds[2], locationIds[5], partnerIds[2], 8.0, 'kg', 16.0750, 108.2210, 0.03, 800, 'VERIFIED', daysAgo(80), daysAgo(80)],
      [userIds[2], locationIds[6], partnerIds[2], 5.5, 'kg', 16.0880, 108.2483, 0.04, 550, 'VERIFIED', daysAgo(65), daysAgo(65)],
      [userIds[2], locationIds[5], partnerIds[2], 6.2, 'kg', 16.0749, 108.2209, 0.02, 620, 'VERIFIED', daysAgo(45), daysAgo(45)],
      // User 4 - Hoàng Văn Em (top user)
      [userIds[4], locationIds[0], partnerIds[0], 10.0, 'kg', 21.0286, 105.8543, 0.02, 1000, 'VERIFIED', daysAgo(95), daysAgo(95)],
      [userIds[4], locationIds[1], partnerIds[0], 8.5, 'kg', 21.0246, 105.8433, 0.03, 850, 'VERIFIED', daysAgo(80), daysAgo(80)],
      [userIds[4], locationIds[2], partnerIds[0], 7.2, 'kg', 21.0379, 105.7895, 0.03, 720, 'VERIFIED', daysAgo(65), daysAgo(65)],
      [userIds[4], locationIds[0], partnerIds[0], 9.0, 'kg', 21.0287, 105.8542, 0.02, 900, 'VERIFIED', daysAgo(45), daysAgo(45)],
      [userIds[4], locationIds[1], partnerIds[0], 4.8, 'kg', 21.0247, 105.8434, 0.04, 480, 'VERIFIED', daysAgo(25), daysAgo(25)],
      // User 7 - Bùi Thị Hoa
      [userIds[7], locationIds[9], partnerIds[3], 3.5, 'kg', 21.0287, 105.8536, 0.02, 350, 'VERIFIED', daysAgo(55), daysAgo(55)],
      [userIds[7], locationIds[10], partnerIds[3], 4.2, 'kg', 21.0399, 105.7813, 0.03, 420, 'VERIFIED', daysAgo(40), daysAgo(40)],
      [userIds[7], locationIds[9], null, 2.0, 'kg', 21.0286, 105.8535, 0.02, null, 'PENDING', null, daysAgo(2)],
      // User 10 - Nguyễn Minh Long
      [userIds[10], locationIds[0], partnerIds[0], 7.8, 'kg', 21.0285, 105.8541, 0.02, 780, 'VERIFIED', daysAgo(30), daysAgo(30)],
      [userIds[10], locationIds[1], partnerIds[0], 6.5, 'kg', 21.0246, 105.8432, 0.04, 650, 'VERIFIED', daysAgo(20), daysAgo(20)],
      // Bị từ chối
      [userIds[6], locationIds[0], partnerIds[0], 0.5, 'kg', 21.0290, 105.8550, 0.12, 0, 'REJECTED', null, daysAgo(70)],
      // Các user khác
      [userIds[3], locationIds[3], partnerIds[1], 2.8, 'kg', 21.0058, 105.8413, 0.03, 280, 'VERIFIED', daysAgo(100), daysAgo(100)],
      [userIds[5], locationIds[4], partnerIds[1], 3.2, 'kg', 20.9966, 105.8235, 0.04, 320, 'VERIFIED', daysAgo(85), daysAgo(85)],
      [userIds[8], locationIds[2], partnerIds[0], 4.1, 'kg', 21.0378, 105.7893, 0.03, 410, 'VERIFIED', daysAgo(45), daysAgo(45)],
      [userIds[9], locationIds[5], partnerIds[2], 2.5, 'kg', 16.0749, 108.2207, 0.03, 250, 'VERIFIED', daysAgo(35), daysAgo(35)],
      [userIds[12], locationIds[0], partnerIds[0], 1.8, 'kg', 21.0284, 105.8540, 0.03, 180, 'VERIFIED', daysAgo(18), daysAgo(18)],
      [userIds[13], locationIds[9], partnerIds[3], 3.6, 'kg', 21.0286, 105.8533, 0.02, 360, 'VERIFIED', daysAgo(12), daysAgo(12)],
      // Thêm nhiều giao dịch mới hơn để có dữ liệu tháng hiện tại
      [userIds[0], locationIds[0], partnerIds[0], 2.0, 'kg', 21.0285, 105.8542, 0.02, 200, 'VERIFIED', daysAgo(7), daysAgo(7)],
      [userIds[1], locationIds[3], partnerIds[1], 3.5, 'kg', 21.0057, 105.8414, 0.03, 350, 'VERIFIED', daysAgo(6), daysAgo(6)],
      [userIds[4], locationIds[0], partnerIds[0], 5.0, 'kg', 21.0286, 105.8543, 0.02, 500, 'VERIFIED', daysAgo(5), daysAgo(5)],
      [userIds[10], locationIds[1], partnerIds[0], 4.0, 'kg', 21.0245, 105.8431, 0.03, 400, 'VERIFIED', daysAgo(4), daysAgo(4)],
      [userIds[11], locationIds[4], partnerIds[1], 1.5, 'kg', 20.9964, 105.8233, 0.04, 150, 'VERIFIED', daysAgo(3), daysAgo(3)],
    ];

    for (const d of dropoffData) {
      await client.query(
        `INSERT INTO dropoff_transactions (id, user_id, location_id, verified_by, quantity_value, quantity_unit, user_latitude, user_longitude, distance_km, points_awarded, status, confirmed_at, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$13)`,
        [uuidv4(), ...d]
      );
    }
    console.log(`  ✅ Tạo ${dropoffData.length} dropoff transactions`);

    // ============================================================
    // 11. POINT TRANSACTIONS
    // ============================================================
    console.log('💰 Tạo point transactions...');
    const pointTxData = [
      // Nguyễn Văn An
      [userIds[0], 'EARN', 250, 250, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 2.5kg nhựa tại Hoàn Kiếm', daysAgo(155)],
      [userIds[0], 'EARN', 180, 430, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 1.8kg giấy tại Đống Đa', daysAgo(140)],
      [userIds[0], 'EARN', 50, 480, 'QUIZ', 'QUIZ', 'Hoàn thành quiz hàng ngày', daysAgo(135)],
      [userIds[0], 'EARN', 320, 800, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 3.2kg tại Hoàn Kiếm', daysAgo(120)],
      [userIds[0], 'EARN', 100, 900, 'QUIZ', 'QUIZ', 'Đạt điểm cao quiz tuần', daysAgo(115)],
      [userIds[0], 'SPEND', -600, 300, 'REDEEM', 'REDEMPTION', 'Đổi Bộ Ống Hút Inox', daysAgo(100)],
      [userIds[0], 'EARN', 50, 350, 'QUIZ', 'QUIZ', 'Quiz hàng ngày', daysAgo(90)],
      [userIds[0], 'EARN', 500, 850, 'TRASH_CLASSIFICATION', 'TRASH_CLASSIFICATION', 'Phân loại rác AI đạt 95%', daysAgo(60)],
      [userIds[0], 'SPEND', -500, 350, 'REDEEM', 'REDEMPTION', 'Đổi Túi Vải EcoStore', daysAgo(50)],
      [userIds[0], 'EARN', 200, 550, 'TRASH_CLASSIFICATION', 'TRASH_CLASSIFICATION', 'Phân loại rác AI', daysAgo(40)],
      [userIds[0], 'EARN', 150, 700, 'QUIZ', 'QUIZ', 'Bonus quiz tháng', daysAgo(30)],
      [userIds[0], 'EARN', 200, 900, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 2kg tại Hoàn Kiếm', daysAgo(7)],

      // Trần Thị Bích
      [userIds[1], 'EARN', 500, 500, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 5kg tại Bách Khoa', daysAgo(140)],
      [userIds[1], 'EARN', 100, 600, 'QUIZ', 'QUIZ', 'Quiz hàng ngày', daysAgo(135)],
      [userIds[1], 'EARN', 450, 1050, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 4.5kg tại Thanh Xuân', daysAgo(125)],
      [userIds[1], 'EARN', 600, 1650, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 6kg tại Bách Khoa', daysAgo(110)],
      [userIds[1], 'SPEND', -750, 900, 'REDEEM', 'REDEMPTION', 'Đổi Voucher Green Cafe 100k', daysAgo(100)],
      [userIds[1], 'EARN', 380, 1280, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 3.8kg rác', daysAgo(90)],
      [userIds[1], 'EARN', 300, 1580, 'TRASH_CLASSIFICATION', 'TRASH_CLASSIFICATION', 'Phân loại AI', daysAgo(80)],
      [userIds[1], 'EARN', 220, 1800, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 2.2kg tại Thanh Xuân', daysAgo(70)],
      [userIds[1], 'SPEND', -800, 1000, 'REDEEM', 'REDEMPTION', 'Đổi Hộp Cơm Bento', daysAgo(60)],
      [userIds[1], 'EARN', 500, 1500, 'TRASH_CLASSIFICATION', 'TRASH_CLASSIFICATION', 'Phân loại AI chuyên sâu', daysAgo(50)],
      [userIds[1], 'EARN', 200, 1700, 'QUIZ', 'QUIZ', 'Quiz tháng', daysAgo(40)],
      [userIds[1], 'EARN', 350, 2050, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 3.5kg rác tháng này', daysAgo(6)],
      [userIds[1], 'ADJUST', 500, 2550, 'ADMIN_ADJUST', 'ADMIN', 'Thưởng tham gia sự kiện', daysAgo(14)],

      // Lê Minh Cường
      [userIds[2], 'EARN', 800, 800, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 8kg tại Đà Nẵng', daysAgo(80)],
      [userIds[2], 'EARN', 550, 1350, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 5.5kg tại Sơn Trà', daysAgo(65)],
      [userIds[2], 'EARN', 620, 1970, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 6.2kg tại Đà Nẵng', daysAgo(45)],
      [userIds[2], 'SPEND', -1200, 770, 'REDEEM', 'REDEMPTION', 'Đổi Chậu Cây Từ Lốp Xe', daysAgo(40)],
      [userIds[2], 'EARN', 200, 970, 'QUIZ', 'QUIZ', 'Quiz tháng', daysAgo(35)],

      // Phạm Thị Dung
      [userIds[3], 'EARN', 280, 280, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 2.8kg rác', daysAgo(100)],
      [userIds[3], 'EARN', 100, 380, 'QUIZ', 'QUIZ', 'Quiz hàng ngày', daysAgo(90)],
      [userIds[3], 'EARN', 150, 530, 'TRASH_CLASSIFICATION', 'TRASH_CLASSIFICATION', 'Phân loại AI', daysAgo(60)],

      // Hoàng Văn Em (top user)
      [userIds[4], 'EARN', 1000, 1000, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 10kg rác tại Hoàn Kiếm', daysAgo(95)],
      [userIds[4], 'EARN', 200, 1200, 'QUIZ', 'QUIZ', 'Quiz cao điểm', daysAgo(92)],
      [userIds[4], 'EARN', 850, 2050, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 8.5kg tại Đống Đa', daysAgo(80)],
      [userIds[4], 'EARN', 720, 2770, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 7.2kg tại Cầu Giấy', daysAgo(65)],
      [userIds[4], 'EARN', 500, 3270, 'TRASH_CLASSIFICATION', 'TRASH_CLASSIFICATION', 'Phân loại AI hàng loạt', daysAgo(60)],
      [userIds[4], 'SPEND', -3000, 270, 'REDEEM', 'REDEMPTION', 'Đổi Nón Bảo Hiểm Tái Chế', daysAgo(55)],
      [userIds[4], 'EARN', 900, 1170, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 9kg rác tại Hoàn Kiếm', daysAgo(45)],
      [userIds[4], 'EARN', 300, 1470, 'QUIZ', 'QUIZ', 'Quiz tổng hợp', daysAgo(40)],
      [userIds[4], 'EARN', 500, 1970, 'TRASH_CLASSIFICATION', 'TRASH_CLASSIFICATION', 'Phân loại AI', daysAgo(30)],
      [userIds[4], 'EARN', 480, 2450, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 4.8kg rác tại Đống Đa', daysAgo(25)],
      [userIds[4], 'ADJUST', 2000, 4450, 'ADMIN_ADJUST', 'ADMIN', 'Thưởng top user tháng 5', daysAgo(15)],
      [userIds[4], 'EARN', 500, 4950, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 5kg rác tháng này', daysAgo(5)],

      // Vũ Thị Phương
      [userIds[5], 'EARN', 320, 320, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp rác tại Thanh Xuân', daysAgo(85)],
      [userIds[5], 'EARN', 150, 470, 'QUIZ', 'QUIZ', 'Quiz tuần', daysAgo(75)],
      [userIds[5], 'EARN', 200, 670, 'TRASH_CLASSIFICATION', 'TRASH_CLASSIFICATION', 'Phân loại AI', daysAgo(50)],

      // Đỗ Văn Giang
      [userIds[6], 'EARN', 50, 50, 'QUIZ', 'QUIZ', 'Quiz đầu tiên', daysAgo(70)],

      // Bùi Thị Hoa
      [userIds[7], 'EARN', 350, 350, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 3.5kg tại EcoStore', daysAgo(55)],
      [userIds[7], 'EARN', 420, 770, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 4.2kg tại EcoStore Cầu Giấy', daysAgo(40)],
      [userIds[7], 'EARN', 300, 1070, 'TRASH_CLASSIFICATION', 'TRASH_CLASSIFICATION', 'Phân loại AI', daysAgo(35)],
      [userIds[7], 'EARN', 200, 1270, 'QUIZ', 'QUIZ', 'Quiz tuần', daysAgo(30)],
      [userIds[7], 'EARN', 400, 1670, 'TRASH_CLASSIFICATION', 'TRASH_CLASSIFICATION', 'Phân loại nâng cao', daysAgo(25)],
      [userIds[7], 'SPEND', -400, 1270, 'REDEEM', 'REDEMPTION', 'Đổi Voucher Cafe 50k', daysAgo(35)],

      // Đặng Minh Hùng
      [userIds[8], 'EARN', 410, 410, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 4.1kg tại Cầu Giấy', daysAgo(45)],
      [userIds[8], 'EARN', 150, 560, 'QUIZ', 'QUIZ', 'Quiz hàng ngày', daysAgo(40)],
      [userIds[8], 'EARN', 200, 760, 'TRASH_CLASSIFICATION', 'TRASH_CLASSIFICATION', 'Phân loại AI', daysAgo(30)],

      // Lý Thị Kim
      [userIds[9], 'EARN', 250, 250, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 2.5kg tại Đà Nẵng', daysAgo(35)],
      [userIds[9], 'EARN', 100, 350, 'QUIZ', 'QUIZ', 'Quiz tuần', daysAgo(28)],
      [userIds[9], 'SPEND', -350, 0, 'REDEEM', 'REDEMPTION', 'Đổi Cây Xanh Mini', daysAgo(5)],

      // Nguyễn Minh Long
      [userIds[10], 'EARN', 780, 780, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 7.8kg tại Hoàn Kiếm', daysAgo(30)],
      [userIds[10], 'EARN', 200, 980, 'QUIZ', 'QUIZ', 'Quiz tuần', daysAgo(27)],
      [userIds[10], 'EARN', 650, 1630, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 6.5kg tại Đống Đa', daysAgo(20)],
      [userIds[10], 'EARN', 500, 2130, 'TRASH_CLASSIFICATION', 'TRASH_CLASSIFICATION', 'Phân loại AI', daysAgo(15)],
      [userIds[10], 'SPEND', -1500, 630, 'REDEEM', 'REDEMPTION', 'Đổi Bình Nước Giữ Nhiệt', daysAgo(12)],
      [userIds[10], 'ADJUST', 1000, 1630, 'ADMIN_ADJUST', 'ADMIN', 'Thưởng top user mới', daysAgo(8)],
      [userIds[10], 'EARN', 400, 2030, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 4kg tháng này', daysAgo(4)],

      // Trần Thị Mai
      [userIds[11], 'EARN', 200, 200, 'TRASH_CLASSIFICATION', 'TRASH_CLASSIFICATION', 'Phân loại rác AI', daysAgo(25)],
      [userIds[11], 'EARN', 150, 350, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 1.5kg tại Thanh Xuân', daysAgo(3)],

      // Phan Văn Nam
      [userIds[12], 'EARN', 180, 180, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 1.8kg tại Hoàn Kiếm', daysAgo(18)],
      [userIds[12], 'EARN', 100, 280, 'QUIZ', 'QUIZ', 'Quiz hàng ngày', daysAgo(15)],

      // Võ Thị Oanh
      [userIds[13], 'EARN', 360, 360, 'DROPOFF', 'DROPOFF_TRANSACTION', 'Nộp 3.6kg tại EcoStore', daysAgo(12)],
      [userIds[13], 'EARN', 150, 510, 'QUIZ', 'QUIZ', 'Quiz tuần', daysAgo(10)],

      // Mai Văn Phúc
      [userIds[14], 'EARN', 120, 120, 'QUIZ', 'QUIZ', 'Quiz mới tham gia', daysAgo(9)],
    ];

    for (const pt of pointTxData) {
      await client.query(
        `INSERT INTO point_transactions (id, user_id, type, points, balance_after, reason_code, source_type, note, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [uuidv4(), ...pt]
      );
    }
    console.log(`  ✅ Tạo ${pointTxData.length} point transactions`);

    // ============================================================
    // 12. REDEMPTIONS
    // ============================================================
    console.log('🎫 Tạo redemptions...');
    const redemptionData = [
      [userIds[0], rewardIds[3], 600, 'FULFILLED', daysAgo(100)],
      [userIds[0], rewardIds[0], 500, 'FULFILLED', daysAgo(50)],
      [userIds[1], rewardIds[5], 750, 'FULFILLED', daysAgo(100)],
      [userIds[1], rewardIds[2], 800, 'FULFILLED', daysAgo(60)],
      [userIds[4], rewardIds[6], 3000, 'FULFILLED', daysAgo(55)],
      [userIds[7], rewardIds[4], 400, 'FULFILLED', daysAgo(35)],
      [userIds[10], rewardIds[1], 1500, 'FULFILLED', daysAgo(12)],
      [userIds[2], rewardIds[7], 1200, 'FULFILLED', daysAgo(40)],
      [userIds[8], rewardIds[8], 200, 'FULFILLED', daysAgo(30)],
      [userIds[9], rewardIds[10], 350, 'APPROVED', daysAgo(5)],
      // Đang chờ
      [userIds[5], rewardIds[4], 400, 'PENDING', daysAgo(2)],
      [userIds[12], rewardIds[8], 200, 'PENDING', daysAgo(1)],
      [userIds[13], rewardIds[2], 800, 'APPROVED', daysAgo(3)],
      // Bị từ chối
      [userIds[6], rewardIds[0], 500, 'REJECTED', daysAgo(60)],
    ];
    for (const rd of redemptionData) {
      await client.query(
        `INSERT INTO redemptions (id, user_id, reward_id, points_spent, status, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$6)`,
        [uuidv4(), ...rd]
      );
    }
    console.log(`  ✅ Tạo ${redemptionData.length} redemptions`);

    // ============================================================
    // 13. QUIZ QUESTIONS
    // ============================================================
    console.log('❓ Tạo quiz questions...');
    const questionIds = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16].map(i =>
      `a6000000-0000-0000-0000-0000000000${String(i).padStart(2,'0')}`
    );

    const questions = [
      [questionIds[0], 'Phân loại rác', 'easy', 'Chai nhựa PET (mã số 1) thuộc loại rác nào?', 'Chai nhựa PET là nhựa tái chế được. Nên bỏ vào thùng rác tái chế màu vàng/xanh lá.', 'ACTIVE', 'MANUAL', adminId, adminId, daysAgo(100)],
      [questionIds[1], 'Phân loại rác', 'easy', 'Vỏ trái cây và thức ăn thừa nên bỏ vào thùng rác nào?', 'Thức ăn thừa và vỏ trái cây là rác hữu cơ, có thể ủ phân compost.', 'ACTIVE', 'MANUAL', adminId, adminId, daysAgo(100)],
      [questionIds[2], 'Tái chế', 'medium', 'Bao nhiêu chai nhựa PET cần để làm 1 chiếc áo thun tái chế?', 'Trung bình cần 25-30 chai nhựa PET 500ml để sản xuất 1 chiếc áo thun polyester tái chế.', 'ACTIVE', 'MANUAL', adminId, adminId, daysAgo(95)],
      [questionIds[3], 'Môi trường', 'medium', 'Thời gian phân hủy của túi nhựa trong môi trường tự nhiên là bao lâu?', 'Túi nhựa thông thường cần 400-1000 năm để phân hủy hoàn toàn trong môi trường tự nhiên.', 'ACTIVE', 'MANUAL', adminId, adminId, daysAgo(95)],
      [questionIds[4], 'Pin và ắc quy', 'hard', 'Tại sao pin không nên bỏ vào thùng rác thông thường?', 'Pin chứa các kim loại nặng như chì, thủy ngân, cadmium rất độc hại. Khi pin vỡ, các chất này thấm vào đất và nước ngầm gây ô nhiễm nghiêm trọng.', 'ACTIVE', 'MANUAL', adminId, adminId, daysAgo(90)],
      [questionIds[5], 'Tiết kiệm năng lượng', 'easy', 'Loại bóng đèn nào tiết kiệm điện nhất?', 'Đèn LED tiết kiệm điện hơn đèn huỳnh quang 40-50% và hơn đèn sợi đốt 80-90%, đồng thời tuổi thọ cao hơn nhiều.', 'ACTIVE', 'MANUAL', adminId, adminId, daysAgo(88)],
      [questionIds[6], 'Nước và môi trường', 'medium', 'Bao nhiêu phần trăm nước trên Trái Đất là nước ngọt có thể sử dụng?', 'Chỉ khoảng 2.5% nước trên Trái Đất là nước ngọt, và trong đó chỉ 0.3% là nước ngầm và nước mặt có thể tiếp cận.', 'ACTIVE', 'MANUAL', adminId, adminId, daysAgo(85)],
      [questionIds[7], 'Khí hậu', 'hard', 'Khí nhà kính nào có tác động làm ấm mạnh nhất so với CO2?', 'SF6 (sulfur hexafluoride) có tiềm năng làm ấm toàn cầu gấp 23,900 lần CO2. Tuy nhiên CH4 và N2O phổ biến hơn.', 'ACTIVE', 'MANUAL', adminId, adminId, daysAgo(82)],
      [questionIds[8], 'Rác thải điện tử', 'medium', 'Điện thoại cũ nên được xử lý như thế nào?', 'Điện thoại cũ chứa kim loại quý và chất độc hại. Nên mang đến điểm thu gom e-waste để tái chế đúng cách.', 'ACTIVE', 'MANUAL', adminId, adminId, daysAgo(80)],
      [questionIds[9], 'Phân loại rác', 'easy', 'Màu thùng rác nào thường dùng cho rác tái chế tại Việt Nam?', 'Tại Việt Nam, thùng rác màu vàng hoặc xanh lá thường dùng cho rác có thể tái chế.', 'ACTIVE', 'MANUAL', adminId, adminId, daysAgo(78)],
      [questionIds[10], 'Thói quen xanh', 'easy', 'Mỗi người Việt Nam thải ra bao nhiêu kg rác mỗi ngày trung bình?', 'Trung bình mỗi người Việt Nam thải ra khoảng 1.2-1.5 kg rác mỗi ngày, tổng cộng hơn 64,000 tấn/ngày.', 'ACTIVE', 'AI', adminId, adminId, daysAgo(75)],
      [questionIds[11], 'Tái chế', 'medium', 'Giấy có thể được tái chế tối đa bao nhiêu lần?', 'Giấy có thể được tái chế khoảng 5-7 lần. Mỗi lần tái chế, sợi giấy ngắn đi và yếu hơn.', 'ACTIVE', 'MANUAL', adminId, adminId, daysAgo(72)],
      [questionIds[12], 'Môi trường', 'hard', 'Diện tích rừng Amazon bị chặt phá mỗi phút là bao nhiêu?', 'Ước tính khoảng 1.4-2 hectare rừng Amazon bị phá mỗi phút, tương đương 2 sân bóng đá.', 'ACTIVE', 'AI', adminId, adminId, daysAgo(70)],
      [questionIds[13], 'EcoHabit', 'easy', 'Trong ứng dụng EcoHabit, bạn kiếm điểm bằng cách nào?', 'Bạn có thể kiếm điểm bằng cách: nộp rác tại điểm thu gom, phân loại rác qua AI, hoàn thành quiz môi trường hàng ngày.', 'ACTIVE', 'MANUAL', adminId, adminId, daysAgo(68)],
      [questionIds[14], 'Thói quen xanh', 'medium', 'Túi vải cần được sử dụng bao nhiêu lần để bù đắp lượng carbon tạo ra khi sản xuất?', 'Túi vải cotton cần được sử dụng khoảng 131 lần để bù đắp lượng carbon thải ra trong quá trình sản xuất.', 'ACTIVE', 'MANUAL', adminId, adminId, daysAgo(65)],
      [questionIds[15], 'Phân loại rác', 'easy', 'Hộp sữa Tetra Pak có thể tái chế không?', 'Hộp sữa Tetra Pak gồm nhiều lớp giấy, nhựa và nhôm, nhưng vẫn có thể tái chế tại các cơ sở chuyên dụng.', 'PENDING_REVIEW', 'MANUAL', userIds[1], null, null],
    ];

    for (const q of questions) {
      const [id, topic, diff, content, expl, status, source, createdById, reviewedById, reviewedAt] = q;
      const createdAt = reviewedAt || new Date().toISOString();
      await client.query(
        `INSERT INTO quiz_questions (id, topic, difficulty, content, explanation, status, source, created_by_id, reviewed_by_id, reviewed_at, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())`,
        [id, topic, diff, content, expl, status, source, createdById, reviewedById, reviewedAt, createdAt]
      );
    }
    console.log(`  ✅ Tạo ${questions.length} quiz questions`);

    // ============================================================
    // 14. QUIZ OPTIONS
    // ============================================================
    console.log('📝 Tạo quiz options...');
    const optionsData = [
      // Q0: Chai nhựa PET
      [questionIds[0], 'Rác hữu cơ', false, 1],
      [questionIds[0], 'Rác tái chế', true, 2],
      [questionIds[0], 'Rác nguy hại', false, 3],
      [questionIds[0], 'Rác thải chung', false, 4],
      // Q1: Vỏ trái cây
      [questionIds[1], 'Thùng rác tái chế màu xanh', false, 1],
      [questionIds[1], 'Thùng rác hữu cơ màu nâu/xanh lá', true, 2],
      [questionIds[1], 'Thùng rác nguy hại màu đỏ', false, 3],
      [questionIds[1], 'Bỏ xuống cống', false, 4],
      // Q2: Chai nhựa làm áo
      [questionIds[2], '5-10 chai', false, 1],
      [questionIds[2], '15-20 chai', false, 2],
      [questionIds[2], '25-30 chai', true, 3],
      [questionIds[2], '50-100 chai', false, 4],
      // Q3: Thời gian phân hủy túi nhựa
      [questionIds[3], '10-20 năm', false, 1],
      [questionIds[3], '50-100 năm', false, 2],
      [questionIds[3], '400-1000 năm', true, 3],
      [questionIds[3], 'Không bao giờ phân hủy', false, 4],
      // Q4: Pin và môi trường
      [questionIds[4], 'Pin sẽ cháy và gây hỏa hoạn', false, 1],
      [questionIds[4], 'Pin chứa kim loại nặng độc hại, ô nhiễm đất và nước ngầm', true, 2],
      [questionIds[4], 'Pin làm ô nhiễm không khí khi phân hủy', false, 3],
      [questionIds[4], 'Pin chiếm nhiều diện tích bãi rác', false, 4],
      // Q5: Bóng đèn
      [questionIds[5], 'Đèn sợi đốt', false, 1],
      [questionIds[5], 'Đèn huỳnh quang', false, 2],
      [questionIds[5], 'Đèn LED', true, 3],
      [questionIds[5], 'Đèn halogen', false, 4],
      // Q6: Nước ngọt
      [questionIds[6], '10%', false, 1],
      [questionIds[6], '2.5%', true, 2],
      [questionIds[6], '50%', false, 3],
      [questionIds[6], '75%', false, 4],
      // Q7: Khí nhà kính
      [questionIds[7], 'CO2', false, 1],
      [questionIds[7], 'Methane (CH4)', false, 2],
      [questionIds[7], 'N2O', false, 3],
      [questionIds[7], 'SF6 (sulfur hexafluoride)', true, 4],
      // Q8: Điện thoại cũ
      [questionIds[8], 'Bỏ vào thùng rác thông thường', false, 1],
      [questionIds[8], 'Mang đến điểm thu gom e-waste để tái chế', true, 2],
      [questionIds[8], 'Đốt để tái chế kim loại', false, 3],
      [questionIds[8], 'Chôn xuống đất', false, 4],
      // Q9: Màu thùng rác
      [questionIds[9], 'Màu đỏ', false, 1],
      [questionIds[9], 'Màu xanh lá hoặc màu vàng', true, 2],
      [questionIds[9], 'Màu xám', false, 3],
      [questionIds[9], 'Màu trắng', false, 4],
      // Q10: Lượng rác
      [questionIds[10], '0.3-0.5 kg', false, 1],
      [questionIds[10], '1.2-1.5 kg', true, 2],
      [questionIds[10], '3-5 kg', false, 3],
      [questionIds[10], '10 kg', false, 4],
      // Q11: Tái chế giấy
      [questionIds[11], '1-2 lần', false, 1],
      [questionIds[11], '3-4 lần', false, 2],
      [questionIds[11], '5-7 lần', true, 3],
      [questionIds[11], 'Không giới hạn', false, 4],
      // Q12: Amazon
      [questionIds[12], 'Không đáng kể', false, 1],
      [questionIds[12], 'Khoảng 1.4-2 hectare mỗi phút', true, 2],
      [questionIds[12], '10 hectare mỗi giờ', false, 3],
      [questionIds[12], '100 hectare mỗi ngày', false, 4],
      // Q13: EcoHabit điểm
      [questionIds[13], 'Chỉ khi mua sắm tại cửa hàng đối tác', false, 1],
      [questionIds[13], 'Nộp rác, phân loại AI, hoàn thành quiz', true, 2],
      [questionIds[13], 'Chỉ khi chia sẻ lên mạng xã hội', false, 3],
      [questionIds[13], 'Chỉ khi đăng nhập hàng ngày', false, 4],
      // Q14: Túi vải carbon
      [questionIds[14], '11 lần', false, 1],
      [questionIds[14], '50 lần', false, 2],
      [questionIds[14], '131 lần', true, 3],
      [questionIds[14], '500 lần', false, 4],
    ];

    for (const opt of optionsData) {
      await client.query(
        `INSERT INTO quiz_options (id, question_id, content, is_correct, sort_order) VALUES ($1,$2,$3,$4,$5)`,
        [uuidv4(), ...opt]
      );
    }
    console.log(`  ✅ Tạo ${optionsData.length} quiz options`);

    // Commit
    await client.query('COMMIT');
    console.log('\n🎉 ============================================');
    console.log('   SEED DATA HOÀN TẤT!');
    console.log('=============================================');

    // Thống kê
    const stats = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM partner_profiles) as partners,
        (SELECT COUNT(*) FROM locations) as locations,
        (SELECT COUNT(*) FROM rewards) as rewards,
        (SELECT COUNT(*) FROM dropoff_transactions) as dropoffs,
        (SELECT COUNT(*) FROM redemptions) as redemptions,
        (SELECT COUNT(*) FROM quiz_questions) as questions,
        (SELECT COUNT(*) FROM point_transactions) as point_txs
    `);
    const s = stats.rows[0];
    console.log(`   👥 Users: ${s.users} (1 admin, 5 partners, ${parseInt(s.users)-6} users)`);
    console.log(`   🏢 Partners: ${s.partners}`);
    console.log(`   📍 Locations: ${s.locations}`);
    console.log(`   🎁 Rewards: ${s.rewards}`);
    console.log(`   🗑️  Dropoff Transactions: ${s.dropoffs}`);
    console.log(`   🎫 Redemptions: ${s.redemptions}`);
    console.log(`   ❓ Quiz Questions: ${s.questions}`);
    console.log(`   💰 Point Transactions: ${s.point_txs}`);
    console.log('=============================================\n');
    console.log('📋 Tài khoản demo:');
    console.log('   Admin:   admin@ecohabit.vn / Password123!');
    console.log('   Partner: partner.xanh@gmail.com / Password123!');
    console.log('   User:    nguyen.van.an@gmail.com / Password123!');
    console.log('   Top:     caongatcv987@gmail.com / Password123! (21,500 điểm)');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Lỗi:', err.message);
    console.error(err.detail || '');
    throw err;
  } finally {
    await client.end();
  }
}

seed().catch(console.error);
