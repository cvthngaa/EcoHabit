-- ============================================================
-- ECOHABIT DEMO DATA SEED SCRIPT
-- Chạy bằng: psql -U postgres -d EcoHabit_db -f seed-demo-data.sql
-- ============================================================

-- Xóa dữ liệu cũ (theo thứ tự FK)
TRUNCATE TABLE quiz_attempt_answers CASCADE;
TRUNCATE TABLE quiz_attempts CASCADE;
TRUNCATE TABLE daily_quiz_set_questions CASCADE;
TRUNCATE TABLE daily_quiz_sets CASCADE;
TRUNCATE TABLE quiz_options CASCADE;
TRUNCATE TABLE quiz_questions CASCADE;
TRUNCATE TABLE redemptions CASCADE;
TRUNCATE TABLE reward_pickup_options CASCADE;
TRUNCATE TABLE rewards CASCADE;
TRUNCATE TABLE dropoff_transactions CASCADE;
TRUNCATE TABLE accepted_waste_types CASCADE;
TRUNCATE TABLE location_capabilities CASCADE;
TRUNCATE TABLE collection_location_profiles CASCADE;
TRUNCATE TABLE locations CASCADE;
TRUNCATE TABLE point_transactions CASCADE;
TRUNCATE TABLE partner_role_types CASCADE;
TRUNCATE TABLE partner_profiles CASCADE;
TRUNCATE TABLE users CASCADE;

-- ============================================================
-- 1. USERS
-- Password hash cho "Password123!" (bcrypt)
-- ============================================================
INSERT INTO users (id, email, password_hash, full_name, avatar_url, role, status, points_balance, created_at, updated_at) VALUES

-- Admin
('a0000000-0000-0000-0000-000000000001', 'admin@ecohabit.vn', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Quản Trị Viên EcoHabit', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 'ADMIN', 'ACTIVE', 0, NOW() - INTERVAL '180 days', NOW()),

-- Partners (COLLECTOR + REWARD_PROVIDER)
('b0000000-0000-0000-0000-000000000001', 'partner.xanh@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Công Ty Xanh Sạch', 'https://api.dicebear.com/7.x/avataaars/svg?seed=partner1', 'PARTNER', 'ACTIVE', 0, NOW() - INTERVAL '150 days', NOW()),
('b0000000-0000-0000-0000-000000000002', 'partner.moitruong@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Trung Tâm Môi Trường Xanh', 'https://api.dicebear.com/7.x/avataaars/svg?seed=partner2', 'PARTNER', 'ACTIVE', 0, NOW() - INTERVAL '120 days', NOW()),
('b0000000-0000-0000-0000-000000000003', 'partner.recycle@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Tái Chế Việt Nam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=partner3', 'PARTNER', 'ACTIVE', 0, NOW() - INTERVAL '90 days', NOW()),
('b0000000-0000-0000-0000-000000000004', 'partner.ecostore@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'EcoStore Hà Nội', 'https://api.dicebear.com/7.x/avataaars/svg?seed=partner4', 'PARTNER', 'ACTIVE', 0, NOW() - INTERVAL '60 days', NOW()),
('b0000000-0000-0000-0000-000000000005', 'partner.greencafe@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Green Cafe & Rewards', 'https://api.dicebear.com/7.x/avataaars/svg?seed=partner5', 'PARTNER', 'ACTIVE', 0, NOW() - INTERVAL '45 days', NOW()),

-- Users thông thường (đa dạng điểm)
('c0000000-0000-0000-0000-000000000001', 'nguyen.van.an@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyễn Văn An', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1', 'USER', 'ACTIVE', 4250, NOW() - INTERVAL '160 days', NOW()),
('c0000000-0000-0000-0000-000000000002', 'tran.thi.bich@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Trần Thị Bích', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2', 'USER', 'ACTIVE', 8900, NOW() - INTERVAL '145 days', NOW()),
('c0000000-0000-0000-0000-000000000003', 'le.minh.cuong@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lê Minh Cường', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3', 'USER', 'ACTIVE', 12600, NOW() - INTERVAL '130 days', NOW()),
('c0000000-0000-0000-0000-000000000004', 'pham.thi.dung@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Phạm Thị Dung', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user4', 'USER', 'ACTIVE', 3100, NOW() - INTERVAL '115 days', NOW()),
('c0000000-0000-0000-0000-000000000005', 'caongatcv987@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Hoàng Văn Em', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user5', 'USER', 'ACTIVE', 21500, NOW() - INTERVAL '100 days', NOW()),
('c0000000-0000-0000-0000-000000000006', 'vu.thi.phuong@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Vũ Thị Phương', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user6', 'USER', 'ACTIVE', 7800, NOW() - INTERVAL '90 days', NOW()),
('c0000000-0000-0000-0000-000000000007', 'do.van.giang@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Đỗ Văn Giang', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user7', 'USER', 'ACTIVE', 550, NOW() - INTERVAL '75 days', NOW()),
('c0000000-0000-0000-0000-000000000008', 'bui.thi.hoa@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bùi Thị Hoa', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user8', 'USER', 'ACTIVE', 16200, NOW() - INTERVAL '60 days', NOW()),
('c0000000-0000-0000-0000-000000000009', 'dang.minh.hung@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Đặng Minh Hùng', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user9', 'USER', 'ACTIVE', 9300, NOW() - INTERVAL '50 days', NOW()),
('c0000000-0000-0000-0000-000000000010', 'ly.thi.kim@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lý Thị Kim', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user10', 'USER', 'ACTIVE', 5600, NOW() - INTERVAL '40 days', NOW()),
('c0000000-0000-0000-0000-000000000011', 'nguyen.minh.long@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nguyễn Minh Long', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user11', 'USER', 'ACTIVE', 18750, NOW() - INTERVAL '35 days', NOW()),
('c0000000-0000-0000-0000-000000000012', 'tran.thi.mai@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Trần Thị Mai', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user12', 'USER', 'ACTIVE', 2400, NOW() - INTERVAL '28 days', NOW()),
('c0000000-0000-0000-0000-000000000013', 'phan.van.nam@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Phan Văn Nam', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user13', 'USER', 'ACTIVE', 6750, NOW() - INTERVAL '20 days', NOW()),
('c0000000-0000-0000-0000-000000000014', 'vo.thi.oanh@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Võ Thị Oanh', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user14', 'USER', 'ACTIVE', 11300, NOW() - INTERVAL '15 days', NOW()),
('c0000000-0000-0000-0000-000000000015', 'mai.van.phuc@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mai Văn Phúc', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user15', 'USER', 'ACTIVE', 1200, NOW() - INTERVAL '10 days', NOW()),
-- Tài khoản bị khóa (để demo)
('c0000000-0000-0000-0000-000000000016', 'user.locked@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Người Dùng Bị Khóa', NULL, 'USER', 'INACTIVE', 0, NOW() - INTERVAL '50 days', NOW()),
('c0000000-0000-0000-0000-000000000017', 'spam.user@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Tài Khoản Vi Phạm', NULL, 'USER', 'LOCKED', 0, NOW() - INTERVAL '30 days', NOW());

UPDATE users SET locked_reason = 'Vi phạm chính sách cộng đồng - spam báo cáo sai', locked_at = NOW() - INTERVAL '25 days' WHERE id = 'c0000000-0000-0000-0000-000000000017';

-- ============================================================
-- 2. PARTNER PROFILES
-- ============================================================
INSERT INTO partner_profiles (id, user_id, organization_name, organization_type, contact_name, contact_phone, contact_email, tax_code, address, approval_status, auto_confirm_checkin, approved_by, approved_at, created_at, updated_at) VALUES
('p0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Công Ty TNHH Xanh Sạch', 'Công ty thu gom rác thải', 'Nguyễn Thành Tâm', '0901234567', 'partner.xanh@gmail.com', '0101234567', '123 Lê Duẩn, Hà Nội', 'APPROVED', true, 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '140 days', NOW() - INTERVAL '150 days', NOW()),
('p0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Trung Tâm Môi Trường Xanh', 'Tổ chức phi lợi nhuận', 'Trần Văn Bình', '0912345678', 'partner.moitruong@gmail.com', '0202345678', '456 Nguyễn Huệ, Hà Nội', 'APPROVED', false, 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '110 days', NOW() - INTERVAL '120 days', NOW()),
('p0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000003', 'Tái Chế Việt Nam JSC', 'Công ty cổ phần', 'Lê Thị Châu', '0923456789', 'partner.recycle@gmail.com', '0303456789', '789 Hoàng Diệu, Đà Nẵng', 'APPROVED', true, 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '80 days', NOW() - INTERVAL '90 days', NOW()),
('p0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000004', 'EcoStore Hà Nội', 'Cửa hàng xanh', 'Phạm Minh Đức', '0934567890', 'partner.ecostore@gmail.com', '0404567890', '12 Đinh Tiên Hoàng, Hà Nội', 'APPROVED', false, 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '50 days', NOW() - INTERVAL '60 days', NOW()),
('p0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000005', 'Green Cafe & Rewards', 'Nhà hàng/Cafe thân thiện môi trường', 'Hoàng Thu Hương', '0945678901', 'partner.greencafe@gmail.com', '0505678901', '88 Tràng Tiền, Hà Nội', 'PENDING', false, NULL, NULL, NOW() - INTERVAL '45 days', NOW());

-- ============================================================
-- 3. PARTNER ROLE TYPES
-- ============================================================
INSERT INTO partner_role_types (id, partner_profile_id, role_type, is_active, created_at, updated_at) VALUES
('r0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'COLLECTOR', true, NOW() - INTERVAL '150 days', NOW()),
('r0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000002', 'COLLECTOR', true, NOW() - INTERVAL '120 days', NOW()),
('r0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000003', 'COLLECTOR', true, NOW() - INTERVAL '90 days', NOW()),
('r0000000-0000-0000-0000-000000000004', 'p0000000-0000-0000-0000-000000000003', 'REWARD_PROVIDER', true, NOW() - INTERVAL '90 days', NOW()),
('r0000000-0000-0000-0000-000000000005', 'p0000000-0000-0000-0000-000000000004', 'REWARD_PROVIDER', true, NOW() - INTERVAL '60 days', NOW()),
('r0000000-0000-0000-0000-000000000006', 'p0000000-0000-0000-0000-000000000005', 'REWARD_PROVIDER', true, NOW() - INTERVAL '45 days', NOW());

-- ============================================================
-- 4. LOCATIONS (Điểm thu gom)
-- ============================================================
INSERT INTO locations (id, created_by, verified_by, name, address, contact_phone, latitude, longitude, status, partner_profile_id, created_at, updated_at) VALUES

-- Locations của Partner 1 - Xanh Sạch (Hà Nội)
('l0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Điểm Thu Gom Hoàn Kiếm', '35 Lý Thái Tổ, Hoàn Kiếm, Hà Nội', '0901234567', 21.0285, 105.8542, 'APPROVED', 'p0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '140 days', NOW()),
('l0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Điểm Thu Gom Đống Đa', '72 Tôn Đức Thắng, Đống Đa, Hà Nội', '0901234567', 21.0245, 105.8432, 'APPROVED', 'p0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '130 days', NOW()),
('l0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Điểm Thu Gom Cầu Giấy', '144 Xuân Thủy, Cầu Giấy, Hà Nội', '0901234567', 21.0378, 105.7894, 'APPROVED', 'p0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '120 days', NOW()),

-- Locations của Partner 2 - Môi Trường Xanh
('l0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Trạm Tái Chế Bách Khoa', 'Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội', '0912345678', 21.0056, 105.8412, 'APPROVED', 'p0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '110 days', NOW()),
('l0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Trạm Tái Chế Thanh Xuân', '108 Nguyễn Trãi, Thanh Xuân, Hà Nội', '0912345678', 20.9965, 105.8234, 'APPROVED', 'p0000000-0000-0000-0000-000000000002', NOW() - INTERVAL '100 days', NOW()),

-- Locations của Partner 3 - Tái Chế Việt Nam (Đà Nẵng)
('l0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Trung Tâm Tái Chế Đà Nẵng', '200 Lê Duẩn, Hải Châu, Đà Nẵng', '0923456789', 16.0748, 108.2208, 'APPROVED', 'p0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '85 days', NOW()),
('l0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Điểm Thu Gom Sơn Trà', '15 Ngô Quyền, Sơn Trà, Đà Nẵng', '0923456789', 16.0878, 108.2481, 'APPROVED', 'p0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '75 days', NOW()),

-- Location đang chờ duyệt
('l0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000001', NULL, 'Điểm Thu Gom Tự Báo', '55 Ngô Gia Tự, Long Biên, Hà Nội', '0987654321', 21.0512, 105.8923, 'PENDING', NULL, NOW() - INTERVAL '5 days', NOW()),
('l0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000003', NULL, 'Thùng Rác Tái Chế Khu Dân Cư', '99 Trần Phú, Ba Đình, Hà Nội', '0976543210', 21.0354, 105.8421, 'PENDING', NULL, NOW() - INTERVAL '2 days', NOW()),

-- Location của EcoStore (vừa collect vừa pickup reward)
('l0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'EcoStore - Chi Nhánh Hoàn Kiếm', '12 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội', '0934567890', 21.0285, 105.8534, 'APPROVED', 'p0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '50 days', NOW()),
('l0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'EcoStore - Chi Nhánh Cầu Giấy', '56 Trần Thái Tông, Cầu Giấy, Hà Nội', '0934567890', 21.0398, 105.7812, 'APPROVED', 'p0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '45 days', NOW());

-- ============================================================
-- 5. ACCEPTED WASTE TYPES
-- ============================================================
INSERT INTO accepted_waste_types (id, location_id, waste_type, condition_note) VALUES
-- Location 1 - Hoàn Kiếm
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000001', 'PLASTIC', 'Chai nhựa, túi nhựa sạch, không lẫn thức ăn'),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000001', 'PAPER', 'Giấy báo, bìa carton, sách cũ'),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000001', 'GLASS', 'Chai thủy tinh, lọ thủy tinh'),
-- Location 2 - Đống Đa
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000002', 'PLASTIC', 'Tất cả loại nhựa có mã tái chế 1-7'),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000002', 'METAL', 'Lon kim loại, đồng, nhôm phế liệu'),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000002', 'BATTERY', 'Pin AA, AAA, pin điện thoại cũ'),
-- Location 3 - Cầu Giấy
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000003', 'E_WASTE', 'Điện thoại cũ, máy tính, thiết bị điện tử'),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000003', 'BATTERY', 'Pin lithium, pin laptop'),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000003', 'METAL', 'Nhôm, đồng, sắt phế liệu'),
-- Location 4 - Bách Khoa
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000004', 'PLASTIC', 'Nhựa cứng, nhựa mềm'),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000004', 'PAPER', 'Giấy, bìa, sách báo'),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000004', 'TEXTILE', 'Quần áo cũ còn sử dụng được'),
-- Location 5 - Thanh Xuân
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000005', 'PLASTIC', 'Chai lọ nhựa PET'),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000005', 'GLASS', 'Thủy tinh trong, không vỡ vụn'),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000005', 'TEXTILE', 'Vải, quần áo cũ'),
-- Location 6 - Đà Nẵng
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000006', 'PLASTIC', 'Tất cả loại nhựa'),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000006', 'METAL', 'Kim loại phế liệu các loại'),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000006', 'E_WASTE', 'Thiết bị điện tử cũ'),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000006', 'BATTERY', 'Pin các loại'),
-- Location 7 - Sơn Trà
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000007', 'PLASTIC', 'Chai nhựa, hộp nhựa'),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000007', 'PAPER', 'Giấy, carton'),
-- Location 10 - EcoStore Hoàn Kiếm
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000010', 'PLASTIC', 'Chai nhựa, túi nhựa'),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000010', 'BATTERY', 'Pin tiểu, pin sạc'),
-- Location 11 - EcoStore Cầu Giấy
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000011', 'PLASTIC', 'Nhựa các loại'),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000011', 'PAPER', 'Giấy, bìa');

-- ============================================================
-- 6. LOCATION CAPABILITIES
-- ============================================================
INSERT INTO location_capabilities (id, location_id, capability, created_at, updated_at) VALUES
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000001', 'COLLECTION', NOW(), NOW()),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000002', 'COLLECTION', NOW(), NOW()),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000003', 'COLLECTION', NOW(), NOW()),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000004', 'COLLECTION', NOW(), NOW()),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000005', 'COLLECTION', NOW(), NOW()),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000006', 'COLLECTION', NOW(), NOW()),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000007', 'COLLECTION', NOW(), NOW()),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000010', 'COLLECTION', NOW(), NOW()),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000010', 'REWARD_PICKUP', NOW(), NOW()),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000011', 'COLLECTION', NOW(), NOW()),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000011', 'REWARD_PICKUP', NOW(), NOW());

-- ============================================================
-- 7. COLLECTION LOCATION PROFILES
-- ============================================================
INSERT INTO collection_location_profiles (id, location_id, site_type, instructions, requires_staff_confirmation, created_at, updated_at) VALUES
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000001', 'COUNTER', 'Mang rác đã phân loại đến quầy, nhân viên sẽ cân và xác nhận', true, NOW(), NOW()),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000002', 'BIN', 'Bỏ vào thùng phân loại tương ứng. App sẽ tự xác nhận qua QR code', false, NOW(), NOW()),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000003', 'MACHINE', 'Đưa rác vào máy tự động, máy sẽ nhận diện và cấp điểm', false, NOW(), NOW()),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000004', 'COUNTER', 'Đến quầy nhân viên, xuất trình app để xác nhận', true, NOW(), NOW()),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000005', 'BIN', 'Thùng phân loại màu sắc, scan QR để check-in', false, NOW(), NOW()),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000006', 'COUNTER', 'Mang đến trung tâm, nhân viên tiếp nhận và xác nhận 24/7', true, NOW(), NOW()),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000007', 'BIN', 'Hệ thống thùng thông minh kết nối IoT', false, NOW(), NOW()),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000010', 'COUNTER', 'Mang rác đến quầy thu ngân, đổi điểm ngay', true, NOW(), NOW()),
(gen_random_uuid(), 'l0000000-0000-0000-0000-000000000011', 'COUNTER', 'Quầy thu gom cuối cửa hàng, mở 8h-21h', true, NOW(), NOW());

-- ============================================================
-- 8. REWARDS (Phần thưởng)
-- ============================================================
INSERT INTO rewards (id, name, description, thumbnail_url, points_cost, stock, status, partner_profile_id, created_at, updated_at) VALUES
-- Rewards của EcoStore
('w0000000-0000-0000-0000-000000000001', 'Túi Vải EcoStore', 'Túi vải canvas tái chế 100%, in logo EcoHabit. Kích thước 40x35cm, bền đẹp dùng hàng ngày', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 500, 200, 'ACTIVE', 'p0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '50 days', NOW()),
('w0000000-0000-0000-0000-000000000002', 'Bình Nước Giữ Nhiệt', 'Bình inox 500ml không BPA, giữ lạnh 24h giữ nóng 12h. Giảm thiểu rác nhựa', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', 1500, 80, 'ACTIVE', 'p0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '48 days', NOW()),
('w0000000-0000-0000-0000-000000000003', 'Hộp Cơm Bento Tre', 'Hộp đựng thức ăn làm từ tre tự nhiên 100% phân hủy sinh học, 3 ngăn chia', 'https://images.unsplash.com/photo-1564436872-f6d81182df12?w=400', 800, 150, 'ACTIVE', 'p0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '45 days', NOW()),
('w0000000-0000-0000-0000-000000000004', 'Bộ Ống Hút Inox 6 Cái', 'Ống hút inox tái sử dụng kèm cọ vệ sinh. Thay thế ống hút nhựa dùng 1 lần', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 600, 300, 'ACTIVE', 'p0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '42 days', NOW()),

-- Rewards của Green Cafe
('w0000000-0000-0000-0000-000000000005', 'Voucher Cà Phê Green Cafe 50k', 'Voucher uống cà phê tại Green Cafe, áp dụng cho cả menu. Hết hạn 30 ngày', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', 400, 100, 'ACTIVE', 'p0000000-0000-0000-0000-000000000005', NOW() - INTERVAL '40 days', NOW()),
('w0000000-0000-0000-0000-000000000006', 'Voucher Green Cafe 100k', 'Voucher trị giá 100k dùng cho bữa ăn tại Green Cafe. Đồ ăn organic, bao bì xanh', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400', 750, 50, 'ACTIVE', 'p0000000-0000-0000-0000-000000000005', NOW() - INTERVAL '38 days', NOW()),

-- Rewards của Tái Chế Việt Nam
('w0000000-0000-0000-0000-000000000007', 'Nón Bảo Hiểm Tái Chế', 'Nón bảo hiểm làm từ nhựa tái chế 70%, đạt chuẩn an toàn Việt Nam', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400', 3000, 30, 'ACTIVE', 'p0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '80 days', NOW()),
('w0000000-0000-0000-0000-000000000008', 'Chậu Cây Từ Lốp Xe Cũ', 'Chậu cây trang trí độc đáo tái chế từ lốp xe, đường kính 30cm, nhiều màu', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', 1200, 60, 'ACTIVE', 'p0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '75 days', NOW()),
('w0000000-0000-0000-0000-000000000009', 'Túi Giấy Handmade 5 Cái', 'Bộ 5 túi giấy handmade từ báo tái chế, nhiều kích cỡ, thân thiện môi trường', 'https://images.unsplash.com/photo-1586449480537-3a82b3c9e5f5?w=400', 200, 500, 'ACTIVE', 'p0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '70 days', NOW()),

-- Reward hết hàng / inactive
('w0000000-0000-0000-0000-000000000010', 'Áo Thun Eco (Hết Hàng)', 'Áo thun cotton hữu cơ 100%, in hình EcoHabit', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 2000, 0, 'INACTIVE', 'p0000000-0000-0000-0000-000000000004', NOW() - INTERVAL '50 days', NOW()),
('w0000000-0000-0000-0000-000000000011', 'Cây Xanh Mini', 'Cây cảnh mini để bàn, tạo không khí trong lành cho văn phòng', 'https://images.unsplash.com/photo-1509587584298-0f3620e1604b?w=400', 350, 80, 'ACTIVE', 'p0000000-0000-0000-0000-000000000003', NOW() - INTERVAL '65 days', NOW());

-- ============================================================
-- 9. REWARD PICKUP OPTIONS
-- ============================================================
INSERT INTO reward_pickup_options (id, reward_id, location_id, created_at, updated_at) VALUES
(gen_random_uuid(), 'w0000000-0000-0000-0000-000000000001', 'l0000000-0000-0000-0000-000000000010', NOW(), NOW()),
(gen_random_uuid(), 'w0000000-0000-0000-0000-000000000001', 'l0000000-0000-0000-0000-000000000011', NOW(), NOW()),
(gen_random_uuid(), 'w0000000-0000-0000-0000-000000000002', 'l0000000-0000-0000-0000-000000000010', NOW(), NOW()),
(gen_random_uuid(), 'w0000000-0000-0000-0000-000000000003', 'l0000000-0000-0000-0000-000000000010', NOW(), NOW()),
(gen_random_uuid(), 'w0000000-0000-0000-0000-000000000003', 'l0000000-0000-0000-0000-000000000011', NOW(), NOW()),
(gen_random_uuid(), 'w0000000-0000-0000-0000-000000000004', 'l0000000-0000-0000-0000-000000000010', NOW(), NOW()),
(gen_random_uuid(), 'w0000000-0000-0000-0000-000000000004', 'l0000000-0000-0000-0000-000000000011', NOW(), NOW());

-- ============================================================
-- 10. DROPOFF TRANSACTIONS (Giao dịch nộp rác)
-- ============================================================
INSERT INTO dropoff_transactions (id, user_id, location_id, verified_by, quantity_value, quantity_unit, user_latitude, user_longitude, distance_km, points_awarded, status, confirmed_at, created_at, updated_at) VALUES

-- User 1 - Nguyễn Văn An (nhiều giao dịch)
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'l0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 2.5, 'kg', 21.0287, 105.8545, 0.03, 250, 'VERIFIED', NOW() - INTERVAL '155 days', NOW() - INTERVAL '155 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'l0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 1.8, 'kg', 21.0247, 105.8435, 0.04, 180, 'VERIFIED', NOW() - INTERVAL '140 days', NOW() - INTERVAL '140 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'l0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 3.2, 'kg', 21.0286, 105.8543, 0.02, 320, 'VERIFIED', NOW() - INTERVAL '120 days', NOW() - INTERVAL '120 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'l0000000-0000-0000-0000-000000000003', NULL, 1.5, 'kg', 21.0379, 105.7896, 0.05, NULL, 'PENDING', NULL, NOW() - INTERVAL '3 days', NOW()),

-- User 2 - Trần Thị Bích (top user)
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'l0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 5.0, 'kg', 21.0058, 105.8414, 0.04, 500, 'VERIFIED', NOW() - INTERVAL '140 days', NOW() - INTERVAL '140 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'l0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 4.5, 'kg', 21.0967, 105.8237, 0.05, 450, 'VERIFIED', NOW() - INTERVAL '125 days', NOW() - INTERVAL '125 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'l0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 6.0, 'kg', 21.0059, 105.8413, 0.03, 600, 'VERIFIED', NOW() - INTERVAL '110 days', NOW() - INTERVAL '110 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'l0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 3.8, 'kg', 21.0057, 105.8415, 0.04, 380, 'VERIFIED', NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'l0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 2.2, 'kg', 21.0966, 105.8236, 0.04, 220, 'VERIFIED', NOW() - INTERVAL '70 days', NOW() - INTERVAL '70 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'l0000000-0000-0000-0000-000000000004', NULL, 4.0, 'kg', 21.0060, 105.8416, 0.03, NULL, 'PENDING', NULL, NOW() - INTERVAL '1 days', NOW()),

-- User 3 - Lê Minh Cường
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003', 'l0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', 8.0, 'kg', 16.0750, 108.2210, 0.03, 800, 'VERIFIED', NOW() - INTERVAL '80 days', NOW() - INTERVAL '80 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003', 'l0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000003', 5.5, 'kg', 16.0880, 108.2483, 0.04, 550, 'VERIFIED', NOW() - INTERVAL '65 days', NOW() - INTERVAL '65 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003', 'l0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', 6.2, 'kg', 16.0749, 108.2209, 0.02, 620, 'VERIFIED', NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days', NOW()),

-- User 5 - Hoàng Văn Em (top user cao nhất)
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', 'l0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 10.0, 'kg', 21.0286, 105.8543, 0.02, 1000, 'VERIFIED', NOW() - INTERVAL '95 days', NOW() - INTERVAL '95 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', 'l0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 8.5, 'kg', 21.0246, 105.8433, 0.03, 850, 'VERIFIED', NOW() - INTERVAL '80 days', NOW() - INTERVAL '80 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', 'l0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 7.2, 'kg', 21.0379, 105.7895, 0.03, 720, 'VERIFIED', NOW() - INTERVAL '65 days', NOW() - INTERVAL '65 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', 'l0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 9.0, 'kg', 21.0287, 105.8542, 0.02, 900, 'VERIFIED', NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', 'l0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 4.8, 'kg', 21.0247, 105.8434, 0.04, 480, 'VERIFIED', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days', NOW()),

-- User 8 - Bùi Thị Hoa
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000008', 'l0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000004', 3.5, 'kg', 21.0287, 105.8536, 0.02, 350, 'VERIFIED', NOW() - INTERVAL '55 days', NOW() - INTERVAL '55 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000008', 'l0000000-0000-0000-0000-000000000011', 'b0000000-0000-0000-0000-000000000004', 4.2, 'kg', 21.0399, 105.7813, 0.03, 420, 'VERIFIED', NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000008', 'l0000000-0000-0000-0000-000000000010', NULL, 2.0, 'kg', 21.0286, 105.8535, 0.02, NULL, 'PENDING', NULL, NOW() - INTERVAL '2 days', NOW()),

-- User 11 - Nguyễn Minh Long
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000011', 'l0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 7.8, 'kg', 21.0285, 105.8541, 0.02, 780, 'VERIFIED', NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000011', 'l0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 6.5, 'kg', 21.0246, 105.8432, 0.04, 650, 'VERIFIED', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', NOW()),

-- Giao dịch bị từ chối
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000007', 'l0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 0.5, 'kg', 21.0290, 105.8550, 0.12, 0, 'REJECTED', NULL, NOW() - INTERVAL '70 days', NOW()),

-- Thêm giao dịch cho các user khác
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000004', 'l0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 2.8, 'kg', 21.0058, 105.8413, 0.03, 280, 'VERIFIED', NOW() - INTERVAL '100 days', NOW() - INTERVAL '100 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000006', 'l0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 3.2, 'kg', 21.0966, 105.8235, 0.04, 320, 'VERIFIED', NOW() - INTERVAL '85 days', NOW() - INTERVAL '85 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000009', 'l0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 4.1, 'kg', 21.0378, 105.7893, 0.03, 410, 'VERIFIED', NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000010', 'l0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000003', 2.5, 'kg', 16.0749, 108.2207, 0.03, 250, 'VERIFIED', NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000013', 'l0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 1.8, 'kg', 21.0284, 105.8540, 0.03, 180, 'VERIFIED', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000014', 'l0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000004', 3.6, 'kg', 21.0286, 105.8533, 0.02, 360, 'VERIFIED', NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days', NOW());

-- ============================================================
-- 11. POINT TRANSACTIONS
-- ============================================================
INSERT INTO point_transactions (id, user_id, type, points, balance_after, reason_code, source_type, source_id, note, created_at) VALUES

-- Nguyễn Văn An
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'EARN', 250, 250, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp 2.5kg nhựa tại Hoàn Kiếm', NOW() - INTERVAL '155 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'EARN', 180, 430, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp 1.8kg giấy tại Đống Đa', NOW() - INTERVAL '140 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'EARN', 50, 480, 'QUIZ', 'QUIZ', NULL, 'Hoàn thành quiz hàng ngày', NOW() - INTERVAL '135 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'EARN', 320, 800, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp 3.2kg tại Hoàn Kiếm', NOW() - INTERVAL '120 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'EARN', 100, 900, 'QUIZ', 'QUIZ', NULL, 'Đạt điểm cao quiz tuần', NOW() - INTERVAL '115 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'SPEND', -600, 300, 'REDEEM', 'REDEMPTION', NULL, 'Đổi Bộ Ống Hút Inox', NOW() - INTERVAL '100 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'EARN', 50, 350, 'QUIZ', 'QUIZ', NULL, 'Quiz hàng ngày', NOW() - INTERVAL '90 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'EARN', 75, 425, 'QUIZ', 'QUIZ', NULL, 'Quiz tuần', NOW() - INTERVAL '80 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'EARN', 50, 475, 'QUIZ', 'QUIZ', NULL, 'Quiz hàng ngày', NOW() - INTERVAL '70 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'EARN', 500, 975, 'TRASH_CLASSIFICATION', 'TRASH_CLASSIFICATION', NULL, 'Phân loại rác AI đạt 95%', NOW() - INTERVAL '60 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'SPEND', -500, 475, 'REDEEM', 'REDEMPTION', NULL, 'Đổi Túi Vải EcoStore', NOW() - INTERVAL '50 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'EARN', 200, 675, 'TRASH_CLASSIFICATION', 'TRASH_CLASSIFICATION', NULL, 'Phân loại rác AI', NOW() - INTERVAL '40 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'EARN', 150, 825, 'QUIZ', 'QUIZ', NULL, 'Bonus quiz tháng', NOW() - INTERVAL '30 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'EARN', 300, 1125, 'TRASH_CLASSIFICATION', 'TRASH_CLASSIFICATION', NULL, 'Phân loại rác AI', NOW() - INTERVAL '20 days'),

-- Trần Thị Bích (nhiều giao dịch hơn)
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'EARN', 500, 500, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp 5kg tại Bách Khoa', NOW() - INTERVAL '140 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'EARN', 100, 600, 'QUIZ', 'QUIZ', NULL, 'Quiz hàng ngày', NOW() - INTERVAL '135 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'EARN', 450, 1050, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp 4.5kg tại Thanh Xuân', NOW() - INTERVAL '125 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'EARN', 600, 1650, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp 6kg tại Bách Khoa', NOW() - INTERVAL '110 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'SPEND', -750, 900, 'REDEEM', 'REDEMPTION', NULL, 'Đổi Voucher Green Cafe 100k', NOW() - INTERVAL '100 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'EARN', 380, 1280, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp 3.8kg rác', NOW() - INTERVAL '90 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'EARN', 300, 1580, 'TRASH_CLASSIFICATION', 'TRASH_CLASSIFICATION', NULL, 'Phân loại AI', NOW() - INTERVAL '80 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'EARN', 220, 1800, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp 2.2kg tại Thanh Xuân', NOW() - INTERVAL '70 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'SPEND', -800, 1000, 'REDEEM', 'REDEMPTION', NULL, 'Đổi Hộp Cơm Bento', NOW() - INTERVAL '60 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'EARN', 500, 1500, 'TRASH_CLASSIFICATION', 'TRASH_CLASSIFICATION', NULL, 'Phân loại AI chuyên sâu', NOW() - INTERVAL '50 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'EARN', 200, 1700, 'QUIZ', 'QUIZ', NULL, 'Quiz tháng', NOW() - INTERVAL '40 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'EARN', 400, 2100, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp 4kg rác', NOW() - INTERVAL '20 days'),

-- Hoàng Văn Em (top user)
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', 'EARN', 1000, 1000, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp 10kg rác tại Hoàn Kiếm', NOW() - INTERVAL '95 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', 'EARN', 200, 1200, 'QUIZ', 'QUIZ', NULL, 'Quiz cao điểm', NOW() - INTERVAL '92 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', 'EARN', 850, 2050, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp 8.5kg tại Đống Đa', NOW() - INTERVAL '80 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', 'EARN', 720, 2770, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp 7.2kg tại Cầu Giấy', NOW() - INTERVAL '65 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', 'EARN', 500, 3270, 'TRASH_CLASSIFICATION', 'TRASH_CLASSIFICATION', NULL, 'Phân loại AI hàng loạt', NOW() - INTERVAL '60 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', 'SPEND', -3000, 270, 'REDEEM', 'REDEMPTION', NULL, 'Đổi Nón Bảo Hiểm Tái Chế', NOW() - INTERVAL '55 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', 'EARN', 900, 1170, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp 9kg rác tại Hoàn Kiếm', NOW() - INTERVAL '45 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', 'EARN', 300, 1470, 'QUIZ', 'QUIZ', NULL, 'Quiz tổng hợp', NOW() - INTERVAL '40 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', 'EARN', 500, 1970, 'TRASH_CLASSIFICATION', 'TRASH_CLASSIFICATION', NULL, 'Phân loại AI', NOW() - INTERVAL '30 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', 'EARN', 480, 2450, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp 4.8kg rác tại Đống Đa', NOW() - INTERVAL '25 days'),

-- Nguyễn Minh Long
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000011', 'EARN', 780, 780, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp 7.8kg tại Hoàn Kiếm', NOW() - INTERVAL '30 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000011', 'EARN', 200, 980, 'QUIZ', 'QUIZ', NULL, 'Quiz tuần', NOW() - INTERVAL '27 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000011', 'EARN', 650, 1630, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp 6.5kg tại Đống Đa', NOW() - INTERVAL '20 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000011', 'EARN', 500, 2130, 'TRASH_CLASSIFICATION', 'TRASH_CLASSIFICATION', NULL, 'Phân loại AI', NOW() - INTERVAL '15 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000011', 'SPEND', -1500, 630, 'REDEEM', 'REDEMPTION', NULL, 'Đổi Bình Nước Giữ Nhiệt', NOW() - INTERVAL '12 days'),

-- Bùi Thị Hoa
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000008', 'EARN', 350, 350, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp 3.5kg tại EcoStore', NOW() - INTERVAL '55 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000008', 'EARN', 420, 770, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp 4.2kg tại EcoStore Cầu Giấy', NOW() - INTERVAL '40 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000008', 'EARN', 300, 1070, 'TRASH_CLASSIFICATION', 'TRASH_CLASSIFICATION', NULL, 'Phân loại AI', NOW() - INTERVAL '35 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000008', 'EARN', 200, 1270, 'QUIZ', 'QUIZ', NULL, 'Quiz tuần', NOW() - INTERVAL '30 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000008', 'EARN', 400, 1670, 'TRASH_CLASSIFICATION', 'TRASH_CLASSIFICATION', NULL, 'Phân loại nâng cao', NOW() - INTERVAL '25 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000008', 'EARN', 150, 1820, 'QUIZ', 'QUIZ', NULL, 'Quiz hàng ngày', NOW() - INTERVAL '20 days'),

-- Các user khác (giao dịch tổng hợp)
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003', 'EARN', 800, 800, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp 8kg tại Đà Nẵng', NOW() - INTERVAL '80 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003', 'EARN', 550, 1350, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp 5.5kg tại Sơn Trà', NOW() - INTERVAL '65 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003', 'EARN', 620, 1970, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp 6.2kg tại Đà Nẵng', NOW() - INTERVAL '45 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000004', 'EARN', 280, 280, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp 2.8kg rác', NOW() - INTERVAL '100 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000004', 'EARN', 100, 380, 'QUIZ', 'QUIZ', NULL, 'Quiz hàng ngày', NOW() - INTERVAL '90 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000006', 'EARN', 320, 320, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp rác tại Thanh Xuân', NOW() - INTERVAL '85 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000006', 'EARN', 150, 470, 'QUIZ', 'QUIZ', NULL, 'Quiz tuần', NOW() - INTERVAL '75 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000007', 'EARN', 50, 50, 'QUIZ', 'QUIZ', NULL, 'Quiz đầu tiên', NOW() - INTERVAL '70 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000009', 'EARN', 410, 410, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp 4.1kg tại Cầu Giấy', NOW() - INTERVAL '45 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000010', 'EARN', 250, 250, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp 2.5kg tại Đà Nẵng', NOW() - INTERVAL '35 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000012', 'EARN', 200, 200, 'TRASH_CLASSIFICATION', 'TRASH_CLASSIFICATION', NULL, 'Phân loại rác AI', NOW() - INTERVAL '25 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000013', 'EARN', 180, 180, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp 1.8kg tại Hoàn Kiếm', NOW() - INTERVAL '18 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000014', 'EARN', 360, 360, 'DROPOFF', 'DROPOFF_TRANSACTION', NULL, 'Nộp 3.6kg tại EcoStore', NOW() - INTERVAL '12 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000015', 'EARN', 120, 120, 'QUIZ', 'QUIZ', NULL, 'Quiz mới tham gia', NOW() - INTERVAL '9 days'),

-- Điều chỉnh admin
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', 'ADJUST', 2000, 4450, 'ADMIN_ADJUST', 'ADMIN', NULL, 'Thưởng top user tháng 5', NOW() - INTERVAL '15 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'ADJUST', 500, 2600, 'ADMIN_ADJUST', 'ADMIN', NULL, 'Thưởng tham gia sự kiện', NOW() - INTERVAL '14 days'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000011', 'ADJUST', 1000, 1630, 'ADMIN_ADJUST', 'ADMIN', NULL, 'Thưởng top user mới', NOW() - INTERVAL '8 days');

-- ============================================================
-- 12. REDEMPTIONS (Đổi phần thưởng)
-- ============================================================
INSERT INTO redemptions (id, user_id, reward_id, points_spent, status, created_at, updated_at) VALUES
-- Đã hoàn thành
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'w0000000-0000-0000-0000-000000000004', 600, 'FULFILLED', NOW() - INTERVAL '100 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', 'w0000000-0000-0000-0000-000000000001', 500, 'FULFILLED', NOW() - INTERVAL '50 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'w0000000-0000-0000-0000-000000000006', 750, 'FULFILLED', NOW() - INTERVAL '100 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', 'w0000000-0000-0000-0000-000000000003', 800, 'FULFILLED', NOW() - INTERVAL '60 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', 'w0000000-0000-0000-0000-000000000007', 3000, 'FULFILLED', NOW() - INTERVAL '55 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000008', 'w0000000-0000-0000-0000-000000000005', 400, 'FULFILLED', NOW() - INTERVAL '35 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000011', 'w0000000-0000-0000-0000-000000000002', 1500, 'FULFILLED', NOW() - INTERVAL '12 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003', 'w0000000-0000-0000-0000-000000000008', 1200, 'FULFILLED', NOW() - INTERVAL '40 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000009', 'w0000000-0000-0000-0000-000000000009', 200, 'FULFILLED', NOW() - INTERVAL '30 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000010', 'w0000000-0000-0000-0000-000000000011', 350, 'APPROVED', NOW() - INTERVAL '5 days', NOW()),

-- Đang chờ xử lý
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000006', 'w0000000-0000-0000-0000-000000000005', 400, 'PENDING', NOW() - INTERVAL '2 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000013', 'w0000000-0000-0000-0000-000000000009', 200, 'PENDING', NOW() - INTERVAL '1 days', NOW()),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000014', 'w0000000-0000-0000-0000-000000000003', 800, 'APPROVED', NOW() - INTERVAL '3 days', NOW()),

-- Bị từ chối
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000007', 'w0000000-0000-0000-0000-000000000001', 500, 'REJECTED', NOW() - INTERVAL '60 days', NOW());

-- ============================================================
-- 13. QUIZ QUESTIONS
-- ============================================================
INSERT INTO quiz_questions (id, topic, difficulty, content, explanation, status, source, created_by_id, reviewed_by_id, reviewed_at, created_at, updated_at) VALUES
('q0000000-0000-0000-0000-000000000001', 'Phân loại rác', 'easy', 'Chai nhựa PET (mã số 1) thuộc loại rác nào?', 'Chai nhựa PET là nhựa tái chế được. Nên bỏ vào thùng rác tái chế màu vàng/xanh lá.', 'ACTIVE', 'MANUAL', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '100 days', NOW() - INTERVAL '100 days', NOW()),
('q0000000-0000-0000-0000-000000000002', 'Phân loại rác', 'easy', 'Vỏ trái cây và thức ăn thừa nên bỏ vào thùng rác nào?', 'Thức ăn thừa và vỏ trái cây là rác hữu cơ, có thể ủ phân compost.', 'ACTIVE', 'MANUAL', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '100 days', NOW() - INTERVAL '100 days', NOW()),
('q0000000-0000-0000-0000-000000000003', 'Tái chế', 'medium', 'Bao nhiêu chai nhựa PET cần để làm 1 chiếc áo thun tái chế?', 'Trung bình cần 25-30 chai nhựa PET 500ml để sản xuất 1 chiếc áo thun polyester tái chế.', 'ACTIVE', 'MANUAL', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '95 days', NOW() - INTERVAL '95 days', NOW()),
('q0000000-0000-0000-0000-000000000004', 'Môi trường', 'medium', 'Thời gian phân hủy của túi nhựa trong môi trường tự nhiên là bao lâu?', 'Túi nhựa thông thường cần 400-1000 năm để phân hủy hoàn toàn trong môi trường tự nhiên.', 'ACTIVE', 'MANUAL', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '95 days', NOW() - INTERVAL '95 days', NOW()),
('q0000000-0000-0000-0000-000000000005', 'Pin và ắc quy', 'hard', 'Tại sao pin không nên bỏ vào thùng rác thông thường?', 'Pin chứa các kim loại nặng như chì, thủy ngân, cadmium rất độc hại. Khi pin vỡ, các chất này thấm vào đất và nước ngầm gây ô nhiễm nghiêm trọng.', 'ACTIVE', 'MANUAL', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '90 days', NOW() - INTERVAL '90 days', NOW()),
('q0000000-0000-0000-0000-000000000006', 'Tiết kiệm năng lượng', 'easy', 'Loại bóng đèn nào tiết kiệm điện nhất?', 'Đèn LED tiết kiệm điện hơn đèn huỳnh quang 40-50% và hơn đèn sợi đốt 80-90%, đồng thời tuổi thọ cao hơn nhiều.', 'ACTIVE', 'MANUAL', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '88 days', NOW() - INTERVAL '88 days', NOW()),
('q0000000-0000-0000-0000-000000000007', 'Nước và môi trường', 'medium', 'Bao nhiêu phần trăm nước trên Trái Đất là nước ngọt có thể sử dụng?', 'Chỉ khoảng 2.5% nước trên Trái Đất là nước ngọt, và trong đó chỉ 0.3% là nước ngầm và nước mặt có thể tiếp cận được để sử dụng.', 'ACTIVE', 'MANUAL', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '85 days', NOW() - INTERVAL '85 days', NOW()),
('q0000000-0000-0000-0000-000000000008', 'Khí hậu', 'hard', 'Khí nhà kính nào có tác động làm ấm mạnh nhất so với CO2?', 'SF6 (sulfur hexafluoride) có tiềm năng làm ấm toàn cầu gấp 23,900 lần CO2, tuy nhiên CH4 (methane) và N2O phổ biến hơn và cũng rất nguy hiểm.', 'ACTIVE', 'MANUAL', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '82 days', NOW() - INTERVAL '82 days', NOW()),
('q0000000-0000-0000-0000-000000000009', 'Rác thải điện tử', 'medium', 'Điện thoại cũ nên được xử lý như thế nào?', 'Điện thoại cũ chứa kim loại quý (vàng, bạc, đồng) và chất độc hại. Nên mang đến điểm thu gom e-waste để tái chế đúng cách, không bỏ vào thùng rác thông thường.', 'ACTIVE', 'MANUAL', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '80 days', NOW() - INTERVAL '80 days', NOW()),
('q0000000-0000-0000-0000-000000000010', 'Phân loại rác', 'easy', 'Màu thùng rác nào thường dùng cho rác tái chế tại Việt Nam?', 'Tại Việt Nam, thùng rác màu vàng hoặc xanh lá thường dùng cho rác có thể tái chế như nhựa, giấy, kim loại.', 'ACTIVE', 'MANUAL', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '78 days', NOW() - INTERVAL '78 days', NOW()),
('q0000000-0000-0000-0000-000000000011', 'Thói quen xanh', 'easy', 'Mỗi người Việt Nam thải ra bao nhiêu kg rác mỗi ngày trung bình?', 'Trung bình mỗi người Việt Nam thải ra khoảng 1.2-1.5 kg rác mỗi ngày, tổng cộng hơn 64,000 tấn/ngày trên toàn quốc.', 'ACTIVE', 'AI_GENERATED', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '75 days', NOW() - INTERVAL '75 days', NOW()),
('q0000000-0000-0000-0000-000000000012', 'Tái chế', 'medium', 'Giấy có thể được tái chế tối đa bao nhiêu lần?', 'Giấy có thể được tái chế khoảng 5-7 lần. Mỗi lần tái chế, sợi giấy ngắn đi và yếu hơn, đến một lúc không thể tái chế được nữa.', 'ACTIVE', 'MANUAL', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '72 days', NOW() - INTERVAL '72 days', NOW()),
('q0000000-0000-0000-0000-000000000013', 'Môi trường', 'hard', 'Diện tích rừng Amazon bị chặt phá mỗi phút là bao nhiêu?', 'Ước tính khoảng 2,000-3,000 hectare rừng Amazon bị phá mỗi ngày, tức khoảng 1.4-2 hectare mỗi phút, tương đương 2 sân bóng đá.', 'ACTIVE', 'AI_GENERATED', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '70 days', NOW() - INTERVAL '70 days', NOW()),
('q0000000-0000-0000-0000-000000000014', 'EcoHabit', 'easy', 'Trong ứng dụng EcoHabit, bạn kiếm điểm bằng cách nào?', 'Trong EcoHabit, bạn có thể kiếm điểm bằng cách: nộp rác tại điểm thu gom, phân loại rác qua AI, hoàn thành quiz môi trường hàng ngày.', 'ACTIVE', 'MANUAL', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '68 days', NOW() - INTERVAL '68 days', NOW()),
('q0000000-0000-0000-0000-000000000015', 'Thói quen xanh', 'medium', 'Túi vải cần được sử dụng bao nhiêu lần để bù đắp lượng carbon tạo ra khi sản xuất so với túi nhựa?', 'Túi vải cotton cần được sử dụng khoảng 131 lần để bù đắp lượng carbon thải ra trong quá trình sản xuất, so với việc dùng túi nhựa dùng một lần.', 'ACTIVE', 'MANUAL', 'a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', NOW() - INTERVAL '65 days', NOW() - INTERVAL '65 days', NOW()),

-- Câu hỏi đang chờ duyệt
('q0000000-0000-0000-0000-000000000016', 'Phân loại rác', 'easy', 'Hộp sữa Tetra Pak có thể tái chế không?', 'Hộp sữa Tetra Pak gồm nhiều lớp giấy, nhựa và nhôm, nhưng vẫn có thể tái chế tại các cơ sở chuyên dụng.', 'PENDING_REVIEW', 'MANUAL', 'c0000000-0000-0000-0000-000000000002', NULL, NULL, NOW() - INTERVAL '5 days', NOW());

-- ============================================================
-- 14. QUIZ OPTIONS
-- ============================================================
INSERT INTO quiz_options (id, question_id, content, is_correct, sort_order) VALUES
-- Q1: Chai nhựa PET
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000001', 'Rác hữu cơ', false, 1),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000001', 'Rác tái chế', true, 2),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000001', 'Rác nguy hại', false, 3),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000001', 'Rác thải chung', false, 4),

-- Q2: Vỏ trái cây
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000002', 'Thùng rác tái chế màu xanh', false, 1),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000002', 'Thùng rác hữu cơ màu nâu/xanh lá', true, 2),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000002', 'Thùng rác nguy hại màu đỏ', false, 3),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000002', 'Bỏ xuống cống', false, 4),

-- Q3: Chai nhựa làm áo
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000003', '5-10 chai', false, 1),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000003', '15-20 chai', false, 2),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000003', '25-30 chai', true, 3),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000003', '50-100 chai', false, 4),

-- Q4: Thời gian phân hủy túi nhựa
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000004', '10-20 năm', false, 1),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000004', '50-100 năm', false, 2),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000004', '400-1000 năm', true, 3),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000004', 'Không bao giờ phân hủy', false, 4),

-- Q5: Pin và môi trường
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000005', 'Pin sẽ cháy và gây hỏa hoạn', false, 1),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000005', 'Pin chứa kim loại nặng độc hại, ô nhiễm đất và nước ngầm', true, 2),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000005', 'Pin làm ô nhiễm không khí khi phân hủy', false, 3),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000005', 'Pin chiếm nhiều diện tích bãi rác', false, 4),

-- Q6: Bóng đèn tiết kiệm điện
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000006', 'Đèn sợi đốt', false, 1),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000006', 'Đèn huỳnh quang', false, 2),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000006', 'Đèn LED', true, 3),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000006', 'Đèn halogen', false, 4),

-- Q7: Nước ngọt
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000007', '10%', false, 1),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000007', '2.5%', true, 2),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000007', '50%', false, 3),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000007', '75%', false, 4),

-- Q8: Khí nhà kính
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000008', 'CO2', false, 1),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000008', 'Methane (CH4)', false, 2),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000008', 'N2O', false, 3),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000008', 'SF6 (sulfur hexafluoride)', true, 4),

-- Q9: Điện thoại cũ
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000009', 'Bỏ vào thùng rác thông thường', false, 1),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000009', 'Mang đến điểm thu gom e-waste để tái chế', true, 2),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000009', 'Đốt để tái chế kim loại', false, 3),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000009', 'Chôn xuống đất', false, 4),

-- Q10: Màu thùng rác
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000010', 'Màu đỏ', false, 1),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000010', 'Màu xanh lá hoặc màu vàng', true, 2),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000010', 'Màu xám', false, 3),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000010', 'Màu trắng', false, 4),

-- Q11: Lượng rác người Việt
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000011', '0.3-0.5 kg', false, 1),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000011', '1.2-1.5 kg', true, 2),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000011', '3-5 kg', false, 3),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000011', '10 kg', false, 4),

-- Q12: Tái chế giấy
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000012', '1-2 lần', false, 1),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000012', '3-4 lần', false, 2),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000012', '5-7 lần', true, 3),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000012', 'Không giới hạn', false, 4),

-- Q13: Rừng Amazon
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000013', 'Không đáng kể', false, 1),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000013', 'Khoảng 1.4-2 hectare mỗi phút', true, 2),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000013', '10 hectare mỗi giờ', false, 3),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000013', '100 hectare mỗi ngày', false, 4),

-- Q14: EcoHabit điểm
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000014', 'Chỉ khi mua sắm tại cửa hàng đối tác', false, 1),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000014', 'Nộp rác, phân loại AI, hoàn thành quiz', true, 2),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000014', 'Chỉ khi chia sẻ lên mạng xã hội', false, 3),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000014', 'Chỉ khi đăng nhập hàng ngày', false, 4),

-- Q15: Túi vải và carbon
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000015', '11 lần', false, 1),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000015', '50 lần', false, 2),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000015', '131 lần', true, 3),
(gen_random_uuid(), 'q0000000-0000-0000-0000-000000000015', '500 lần', false, 4);

-- ============================================================
-- XÁC NHẬN HOÀN THÀNH
-- ============================================================
DO $$
DECLARE
  user_count INT;
  partner_count INT;
  location_count INT;
  reward_count INT;
  dropoff_count INT;
  redemption_count INT;
  question_count INT;
  transaction_count INT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users;
  SELECT COUNT(*) INTO partner_count FROM partner_profiles;
  SELECT COUNT(*) INTO location_count FROM locations;
  SELECT COUNT(*) INTO reward_count FROM rewards;
  SELECT COUNT(*) INTO dropoff_count FROM dropoff_transactions;
  SELECT COUNT(*) INTO redemption_count FROM redemptions;
  SELECT COUNT(*) INTO question_count FROM quiz_questions;
  SELECT COUNT(*) INTO transaction_count FROM point_transactions;

  RAISE NOTICE '=== SEED DATA HOÀN TẤT ===';
  RAISE NOTICE 'Users: %', user_count;
  RAISE NOTICE 'Partner Profiles: %', partner_count;
  RAISE NOTICE 'Locations: %', location_count;
  RAISE NOTICE 'Rewards: %', reward_count;
  RAISE NOTICE 'Dropoff Transactions: %', dropoff_count;
  RAISE NOTICE 'Redemptions: %', redemption_count;
  RAISE NOTICE 'Quiz Questions: %', question_count;
  RAISE NOTICE 'Point Transactions: %', transaction_count;
  RAISE NOTICE '===========================';
END $$;
