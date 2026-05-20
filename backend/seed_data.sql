-- =====================================================
-- SEED DATA ONLY (No CREATE TABLE/SCHEMA)
-- Use this AFTER running TypeORM Migrations
-- =====================================================

-- USERS
INSERT INTO users (id, email, password_hash, full_name, role, status, points_balance, created_at, updated_at)
VALUES
('11111111-1111-1111-1111-111111111111', 'user1@gmail.com', 'hashed_pw', 'Nguyen Van A', 'USER', 'ACTIVE', 0, NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'partner@gmail.com', 'hashed_pw', 'Partner B', 'PARTNER', 'ACTIVE', 0, NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'admin@gmail.com', 'hashed_pw', 'Admin C', 'ADMIN', 'ACTIVE', 0, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- PARTNER PROFILES
INSERT INTO partner_profiles (
  id, user_id, organization_name, organization_type, contact_name, contact_phone, contact_email, 
  address, approval_status, approved_by, approved_at, created_at, updated_at
)
VALUES (
  '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'Partner B Organization', 
  'ENVIRONMENT_COMPANY', 'Partner B', '0900000000', 'partner@gmail.com', 'TP.HCM', 
  'APPROVED', '33333333-3333-3333-3333-333333333333', NOW(), NOW(), NOW()
)
ON CONFLICT (id) DO NOTHING;

-- PARTNER ROLES
INSERT INTO partner_role_types (id, partner_profile_id, role_type, is_active, created_at, updated_at)
VALUES
('44444444-4444-4444-4444-444444444445', '44444444-4444-4444-4444-444444444444', 'COLLECTOR', TRUE, NOW(), NOW()),
('44444444-4444-4444-4444-444444444446', '44444444-4444-4444-4444-444444444444', 'REWARD_PROVIDER', TRUE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- LOCATIONS
INSERT INTO locations (
  id, created_by, verified_by, partner_profile_id, name, type, address, latitude, longitude, status, created_at, updated_at
)
VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'Thung rac A', 'BIN', 'Q1, TP.HCM', 10.123, 106.123, 'APPROVED', NOW(), NOW()),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'Tram thu gom B', 'CENTER', 'Q2, TP.HCM', 10.456, 106.456, 'APPROVED', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ACCEPTED WASTE TYPES
INSERT INTO accepted_waste_types (id, location_id, waste_type, condition_note, is_active, created_at, updated_at)
VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'PLASTIC', 'Chat thai can sach, kho va da phan loai.', TRUE, NOW(), NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'GLASS', 'Chat thai can sach, kho va da phan loai.', TRUE, NOW(), NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'PAPER', 'Khong lan tap chat, buoc gon neu co the.', TRUE, NOW(), NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb4', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'METAL', 'Khong lan tap chat, buoc gon neu co the.', TRUE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- REWARDS
INSERT INTO rewards (id, name, description, points_cost, stock, status, partner_profile_id, type, created_at, updated_at)
VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Voucher 10k', 'Doi voucher tri gia 10.000 VND', 50, 100, 'ACTIVE', '44444444-4444-4444-4444-444444444444', 'VOUCHER', NOW(), NOW()),
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Binh nuoc tai su dung', 'Qua tang khuyen khich song xanh', 120, 20, 'ACTIVE', '44444444-4444-4444-4444-444444444444', 'PHYSICAL', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- LOCATION CAPABILITIES
INSERT INTO location_capabilities (id, location_id, capability, is_active, created_at)
VALUES
('77777777-7777-7777-7777-777777777771', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'COLLECTION', TRUE, NOW()),
('77777777-7777-7777-7777-777777777772', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'COLLECTION', TRUE, NOW()),
('77777777-7777-7777-7777-777777777773', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'REWARD_PICKUP', TRUE, NOW())
ON CONFLICT (id) DO NOTHING;

-- COLLECTION LOCATION PROFILES
INSERT INTO collection_location_profiles (id, location_id, site_type, instructions, requires_staff_confirmation, created_at, updated_at)
VALUES
('88888888-8888-8888-8888-888888888881', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'RECYCLING', 'Nhan nhua va thuy tinh da lam sach.', TRUE, NOW(), NOW()),
('88888888-8888-8888-8888-888888888882', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'RECYCLING', 'Nhan giay va kim loai tai che.', TRUE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- REWARD PICKUP OPTIONS
INSERT INTO reward_pickup_options (id, reward_id, location_id, is_active, note, created_at, updated_at)
VALUES
('99999999-9999-9999-9999-999999999981', 'f47ac10b-58cc-4372-a567-0e02b2c3d479', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', TRUE, 'Nhan qua tai quay doi tac trong gio hanh chinh.', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- COLLECTION QR SESSIONS
INSERT INTO collection_qr_sessions (id, location_id, qr_token, issued_by, expired_at, is_used, created_at, updated_at)
VALUES
('66666666-6666-6666-6666-666666666661', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'QR-DEMO-COLLECTION-A1', '22222222-2222-2222-2222-222222222222', NOW() + INTERVAL '7 days', FALSE, NOW(), NOW()),
('66666666-6666-6666-6666-666666666662', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'QR-DEMO-COLLECTION-A2', '22222222-2222-2222-2222-222222222222', NOW() + INTERVAL '7 days', FALSE, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
