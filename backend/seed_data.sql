-- =====================================================
-- SEED DATA ONLY (No CREATE TABLE/SCHEMA)
-- Use this AFTER running TypeORM Migrations
-- =====================================================

-- USERS
INSERT INTO users (id, email, password_hash, full_name, role, status, points_balance, created_at, updated_at)
VALUES
('11111111-1111-1111-1111-111111111111', 'user1@gmail.com', '$2b$10$TfeC.5NkK.4JOfJaMq99JuQwirLQzgojvYqwYx7WEGa1s.XZ.G1jK', 'Nguyen Van A', 'USER', 'ACTIVE', 0, NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'partner@gmail.com', '$2b$10$TfeC.5NkK.4JOfJaMq99JuQwirLQzgojvYqwYx7WEGa1s.XZ.G1jK', 'Partner B', 'PARTNER', 'ACTIVE', 0, NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'admin@gmail.com', '$2b$10$DMhM9uAFnA/iuji8WqB9QO0m/MHQr8/prwbbXUN06gX2KZMp8FI3y', 'Admin C', 'ADMIN', 'ACTIVE', 0, NOW(), NOW()),
('22222222-2222-2222-2222-222222222224', 'collector_dn@gmail.com', '$2b$10$TfeC.5NkK.4JOfJaMq99JuQwirLQzgojvYqwYx7WEGa1s.XZ.G1jK', 'Thu Gom ĐN', 'PARTNER', 'ACTIVE', 0, NOW(), NOW()),
('22222222-2222-2222-2222-222222222225', 'rewarder_dn@gmail.com', '$2b$10$TfeC.5NkK.4JOfJaMq99JuQwirLQzgojvYqwYx7WEGa1s.XZ.G1jK', 'Quà Tặng ĐN', 'PARTNER', 'ACTIVE', 0, NOW(), NOW()),
('22222222-2222-2222-2222-222222222226', 'both_dn@gmail.com', '$2b$10$TfeC.5NkK.4JOfJaMq99JuQwirLQzgojvYqwYx7WEGa1s.XZ.G1jK', 'Tổng Hợp ĐN', 'PARTNER', 'ACTIVE', 0, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- PARTNER PROFILES
INSERT INTO partner_profiles (
  id, user_id, organization_name, organization_type, contact_name, contact_phone, contact_email, 
  address, approval_status, approved_by, approved_at, created_at, updated_at
)
VALUES (
  '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Partner B Organization', 
  'ENVIRONMENT_COMPANY', 'Partner B', '0900000000', 'partner@gmail.com', 'TP.HCM', 
  'APPROVED', '33333333-3333-3333-3333-333333333333', NOW(), NOW(), NOW()
),
(
  '44444444-4444-4444-4444-444444444441', '22222222-2222-2222-2222-222222222224', 'Trạm Thu Gom Hòa Khánh', 
  'ENVIRONMENT_COMPANY', 'Mr. Thu Gom', '0911111111', 'collector_dn@gmail.com', 'Hòa Khánh Bắc, Đà Nẵng', 
  'APPROVED', '33333333-3333-3333-3333-333333333333', NOW(), NOW(), NOW()
),
(
  '44444444-4444-4444-4444-444444444442', '22222222-2222-2222-2222-222222222225', 'Điểm Đổi Quà Hòa Khánh', 
  'BRAND', 'Ms. Quà Tặng', '0922222222', 'rewarder_dn@gmail.com', 'Hòa Khánh Bắc, Đà Nẵng', 
  'APPROVED', '33333333-3333-3333-3333-333333333333', NOW(), NOW(), NOW()
),
(
  '44444444-4444-4444-4444-444444444443', '22222222-2222-2222-2222-222222222226', 'Trung Tâm Tổng Hợp Hòa Khánh', 
  'NGO', 'Mr. Tổng Hợp', '0933333333', 'both_dn@gmail.com', 'Hòa Khánh Bắc, Đà Nẵng', 
  'APPROVED', '33333333-3333-3333-3333-333333333333', NOW(), NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

-- PARTNER ROLES
INSERT INTO partner_role_types (id, partner_profile_id, role_type, is_active, created_at, updated_at)
VALUES
('44444444-4444-4444-4444-444444444445', '44444444-4444-4444-4444-444444444444', 'COLLECTOR', TRUE, NOW(), NOW()),
('44444444-4444-4444-4444-444444444446', '44444444-4444-4444-4444-444444444444', 'REWARD_PROVIDER', TRUE, NOW(), NOW()),
('44444444-4444-4444-4444-444444444447', '44444444-4444-4444-4444-444444444441', 'COLLECTOR', TRUE, NOW(), NOW()),
('44444444-4444-4444-4444-444444444448', '44444444-4444-4444-4444-444444444442', 'REWARD_PROVIDER', TRUE, NOW(), NOW()),
('44444444-4444-4444-4444-444444444449', '44444444-4444-4444-4444-444444444443', 'COLLECTOR', TRUE, NOW(), NOW()),
('44444444-4444-4444-4444-444444444450', '44444444-4444-4444-4444-444444444443', 'REWARD_PROVIDER', TRUE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- LOCATIONS
INSERT INTO locations (
  id, created_by, verified_by, partner_profile_id, name, address, latitude, longitude, status, created_at, updated_at
)
VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'Thung rac A', 'Q1, TP.HCM', 10.7745, 106.7020, 'APPROVED', NOW(), NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'Tram thu gom B', 'Q1, TP.HCM', 10.7720, 106.7050, 'APPROVED', NOW(), NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '22222222-2222-2222-2222-222222222224', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444441', 'Trạm thu gom rác Hòa Khánh', '123 Tôn Đức Thắng, Hòa Khánh Bắc, Liên Chiểu, Đà Nẵng', 16.0600, 108.1600, 'APPROVED', NOW(), NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', '22222222-2222-2222-2222-222222222225', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444442', 'Điểm đổi quà Hòa Khánh', '456 Nguyễn Lương Bằng, Hòa Khánh Bắc, Liên Chiểu, Đà Nẵng', 16.0700, 108.1500, 'APPROVED', NOW(), NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', '22222222-2222-2222-2222-222222222226', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444443', 'Trạm tổng hợp Hòa Khánh Bắc', '789 Âu Cơ, Hòa Khánh Bắc, Liên Chiểu, Đà Nẵng', 16.0800, 108.1400, 'APPROVED', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ACCEPTED WASTE TYPES
INSERT INTO accepted_waste_types (id, location_id, waste_type, condition_note)
VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'PLASTIC', 'Chat thai can sach, kho va da phan loai.'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'GLASS', 'Chat thai can sach, kho va da phan loai.'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'PAPER', 'Khong lan tap chat, buoc gon neu co the.'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'METAL', 'Khong lan tap chat, buoc gon neu co the.')
ON CONFLICT (id) DO NOTHING;

-- REWARDS
INSERT INTO rewards (id, name, description, points_cost, stock, status, partner_profile_id, created_at, updated_at)
VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Voucher 10k', 'Doi voucher tri gia 10.000 VND', 50, 100, 'ACTIVE', '44444444-4444-4444-4444-444444444444', NOW(), NOW()),
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Binh nuoc tai su dung', 'Qua tang khuyen khich song xanh', 120, 20, 'ACTIVE', '44444444-4444-4444-4444-444444444444', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- LOCATION CAPABILITIES
INSERT INTO location_capabilities (id, location_id, capability, created_at, updated_at)
VALUES
('77777777-7777-7777-7777-777777777771', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'COLLECTION', NOW(), NOW()),
('77777777-7777-7777-7777-777777777772', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'COLLECTION', NOW(), NOW()),
('77777777-7777-7777-7777-777777777773', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'REWARD_PICKUP', NOW(), NOW()),
('77777777-7777-7777-7777-777777777774', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'COLLECTION', NOW(), NOW()),
('77777777-7777-7777-7777-777777777775', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'REWARD_PICKUP', NOW(), NOW()),
('77777777-7777-7777-7777-777777777776', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'COLLECTION', NOW(), NOW()),
('77777777-7777-7777-7777-777777777777', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'REWARD_PICKUP', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- COLLECTION LOCATION PROFILES
INSERT INTO collection_location_profiles (id, location_id, site_type, instructions, requires_staff_confirmation, created_at, updated_at)
VALUES
('88888888-8888-8888-8888-888888888881', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'COUNTER', 'Nhan nhua va thuy tinh da lam sach.', TRUE, NOW(), NOW()),
('88888888-8888-8888-8888-888888888882', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'COUNTER', 'Nhan giay va kim loai tai che.', TRUE, NOW(), NOW()),
('88888888-8888-8888-8888-888888888883', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'COUNTER', 'Nhan cac loai rac tai che.', TRUE, NOW(), NOW()),
('88888888-8888-8888-8888-888888888884', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'COUNTER', 'Nhan cac loai rac tai che.', TRUE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- REWARD PICKUP OPTIONS
INSERT INTO reward_pickup_options (id, reward_id, location_id, created_at, updated_at)
VALUES
('99999999-9999-9999-9999-999999999981', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- COLLECTION QR SESSIONS
INSERT INTO collection_qr_sessions (id, location_id, qr_token, expired_at, is_used, created_at, updated_at)
VALUES
('66666666-6666-6666-6666-666666666661', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'QR-DEMO-COLLECTION-A1', NOW() + INTERVAL '7 days', FALSE, NOW(), NOW()),
('66666666-6666-6666-6666-666666666662', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'QR-DEMO-COLLECTION-A2', NOW() + INTERVAL '7 days', FALSE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
