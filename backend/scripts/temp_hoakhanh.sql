-- Thêm Partner Hòa Khánh, Đà Nẵng

INSERT INTO users (id, email, password_hash, full_name, avatar_url, role, status, points_balance, created_at, updated_at) VALUES
('b0000000-0000-0000-0000-000000000006', 'partner.hoakhanh@gmail.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Điểm Thu Gom Hòa Khánh', 'https://api.dicebear.com/7.x/avataaars/svg?seed=partner6', 'PARTNER', 'ACTIVE', 0, NOW(), NOW());

INSERT INTO partner_profiles (id, user_id, organization_name, organization_type, contact_name, contact_phone, contact_email, tax_code, address, approval_status, auto_confirm_checkin, approved_by, approved_at, created_at, updated_at) VALUES
('e0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000006', 'Tái Chế Hòa Khánh', 'Doanh nghiệp tư nhân', 'Nguyễn Hòa Khánh', '0956789012', 'partner.hoakhanh@gmail.com', '0606789012', 'Khu công nghiệp Hòa Khánh, Hòa Khánh Bắc, Liên Chiểu, Đà Nẵng', 'APPROVED', true, 'a0000000-0000-0000-0000-000000000001', NOW(), NOW(), NOW());

INSERT INTO partner_role_types (id, partner_profile_id, role_type, is_active, created_at, updated_at) VALUES
('d0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000006', 'COLLECTOR', true, NOW(), NOW());

INSERT INTO locations (id, created_by, verified_by, name, address, contact_phone, latitude, longitude, status, partner_profile_id, created_at, updated_at) VALUES
('c0000000-0000-0000-0000-000000000012', 'b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Trạm Thu Gom Hòa Khánh Bắc', 'Đường số 2, KCN Hòa Khánh, Hòa Khánh Bắc, Liên Chiểu, Đà Nẵng', '0956789012', 16.0691, 108.1348, 'APPROVED', 'e0000000-0000-0000-0000-000000000006', NOW(), NOW());

INSERT INTO accepted_waste_types (id, location_id, waste_type, condition_note) VALUES
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000012', 'BATTERY', 'Nhận các loại pin tiểu, pin sạc, ắc quy nhỏ'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000012', 'E_WASTE', 'Thiết bị điện tử hỏng, bảng mạch, linh kiện'),
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000012', 'PAPER', 'Giấy vụn, bìa carton, sách báo cũ');

INSERT INTO location_capabilities (id, location_id, capability, created_at, updated_at) VALUES
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000012', 'COLLECTION', NOW(), NOW());

INSERT INTO collection_location_profiles (id, location_id, site_type, instructions, requires_staff_confirmation, created_at, updated_at) VALUES
(gen_random_uuid(), 'c0000000-0000-0000-0000-000000000012', 'COUNTER', 'Khách hàng mang rác đến trạm cân, nhân viên sẽ xác nhận và cập nhật điểm', true, NOW(), NOW());
