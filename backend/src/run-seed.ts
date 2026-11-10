import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from './data-source';
import { User } from './modules/users/entities/user.entity';
import { UserRole } from './modules/users/enums/user-role.enum';
import { UserStatus } from './modules/users/enums/user-status.enum';

/**
 * Seed tài khoản demo cho EcoHabit.
 *
 * Chạy sau khi đã migration:run:
 *   npm run seed
 *
 * Mặc định tạo user demo@ecohabit.local / Demo1234!
 * (vai trò USER, 100 điểm ban đầu, trạng thái ACTIVE).
 * Đổi email/mật khẩu qua biến môi trường:
 *   SEED_DEMO_EMAIL, SEED_DEMO_PASSWORD
 *
 * Chạy lại nhiều lần vẫn an toàn: nếu email đã tồn tại thì bỏ qua.
 */
async function main(): Promise<void> {
  await AppDataSource.initialize();
  try {
    const repository = AppDataSource.getRepository(User);
    const email = process.env.SEED_DEMO_EMAIL ?? 'demo@ecohabit.local';
    const password = process.env.SEED_DEMO_PASSWORD ?? 'Demo1234!';

    const existing = await repository.findOne({ where: { email } });
    if (existing) {
      console.log(`[seed] Demo user already exists: ${email} (skipped)`);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = repository.create({
      email,
      passwordHash,
      fullName: 'Demo EcoHabit',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      pointsBalance: 100,
    });
    await repository.save(user);
    console.log(`[seed] Demo user created: ${email}`);
  } finally {
    await AppDataSource.destroy();
  }
}

void main().catch((error: unknown) => {
  console.error('[seed] Failed:', error);
  process.exit(1);
});
