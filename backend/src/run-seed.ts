import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from './data-source';
import { User } from './modules/users/entities/user.entity';
import { UserRole } from './modules/users/enums/user-role.enum';
import { UserStatus } from './modules/users/enums/user-status.enum';
import { Badge } from './modules/badges/entities/badge.entity';
import { BadgeConditionType } from './modules/badges/enums/badge-condition-type.enum';
import { PointTransaction } from './modules/points/entities/point-transaction.entity';
import { PointTransactionType } from './modules/points/enums/point-transaction-type.enum';
import { PointSourceType } from './modules/points/enums/point-source-type.enum';

/**
 * Seed tài khoản demo + huy hiệu mặc định cho EcoHabit.
 *
 * Chạy sau khi đã migration:run:
 *   npm run seed
 *
 * Mặc định tạo user demo@ecohabit.local / Demo1234!
 * (vai trò USER, trạng thái ACTIVE) với 100 điểm ban đầu —
 * ghi bằng một giao dịch điểm thật (ADJUST +100, nguồn ADMIN)
 * để số dư ví và số dư trên tài khoản khớp nhau —
 * và 5 huy hiệu mặc định (FIRST_QUIZ, QUIZ_5, CLASSIFICATION_10,
 * DROPOFF_3, POINTS_100 — giữ nguyên dữ liệu từ migration
 * AddBadgesAndLeaderboard cũ).
 * Đổi email/mật khẩu demo qua biến môi trường:
 *   SEED_DEMO_EMAIL, SEED_DEMO_PASSWORD
 *
 * Chạy lại nhiều lần vẫn an toàn: user/badge nào đã tồn tại thì bỏ qua.
 */
const DEFAULT_BADGES: Array<{
  code: string;
  name: string;
  description: string;
  icon: string;
  conditionType: BadgeConditionType;
  threshold: number;
}> = [
  {
    code: 'FIRST_QUIZ',
    name: 'Người mới xanh',
    description: 'Hoàn thành bài quiz đầu tiên của bạn!',
    icon: '🌱',
    conditionType: BadgeConditionType.FIRST_QUIZ_COMPLETED,
    threshold: 1,
  },
  {
    code: 'QUIZ_5',
    name: 'Người học chăm chỉ',
    description: 'Hoàn thành 5 bài quiz. Kiến thức xanh đang lớn dần!',
    icon: '📚',
    conditionType: BadgeConditionType.QUIZ_COMPLETED_COUNT,
    threshold: 5,
  },
  {
    code: 'CLASSIFICATION_10',
    name: 'Chuyên gia phân loại',
    description: 'Đã phân loại rác 10 lần. Bạn thật sự am hiểu về môi trường!',
    icon: '♻️',
    conditionType: BadgeConditionType.CLASSIFICATION_COUNT,
    threshold: 10,
  },
  {
    code: 'DROPOFF_3',
    name: 'Người tái chế',
    description: 'Đã giao rác thành công 3 lần tại điểm thu gom.',
    icon: '🚮',
    conditionType: BadgeConditionType.DROPOFF_CONFIRMED_COUNT,
    threshold: 3,
  },
  {
    code: 'POINTS_100',
    name: 'Tích điểm xanh',
    description:
      'Đạt 100 điểm xanh. Hành trình bảo vệ Trái Đất của bạn đang rất ấn tượng!',
    icon: '💚',
    conditionType: BadgeConditionType.POINTS_BALANCE_REACHED,
    threshold: 100,
  },
];

async function main(): Promise<void> {
  await AppDataSource.initialize();
  try {
    const userRepository = AppDataSource.getRepository(User);
    const email = process.env.SEED_DEMO_EMAIL ?? 'demo@ecohabit.local';
    const password = process.env.SEED_DEMO_PASSWORD ?? 'Demo1234!';

    let user = await userRepository.findOne({ where: { email } });
    if (!user) {
      const passwordHash = await bcrypt.hash(password, 10);
      user = userRepository.create({
        email,
        passwordHash,
        fullName: 'Demo EcoHabit',
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        pointsBalance: 100,
      });
      await userRepository.save(user);
      console.log(`[seed] Demo user created: ${email}`);
    } else {
      console.log(`[seed] Demo user already exists: ${email} (skipped)`);
    }

    // 100 điểm ban đầu: ghi bằng giao dịch điểm thật để ví
    // (/api/points/balance) khớp với số dư trên tài khoản.
    const pointTransactionRepository =
      AppDataSource.getRepository(PointTransaction);
    const existingTransaction = await pointTransactionRepository.findOne({
      where: { user: { id: user.id } },
    });
    if (existingTransaction) {
      console.log('[seed] Demo points transaction already exists (skipped)');
    } else {
      await pointTransactionRepository.save(
        pointTransactionRepository.create({
          user,
          type: PointTransactionType.ADJUST,
          points: 100,
          balanceAfter: 100,
          sourceType: PointSourceType.ADMIN,
          note: 'Điểm demo ban đầu',
        }),
      );
      if (user.pointsBalance !== 100) {
        await userRepository.update(user.id, { pointsBalance: 100 });
      }
      console.log('[seed] Demo points transaction created: +100');
    }

    const badgeRepository = AppDataSource.getRepository(Badge);
    for (const badge of DEFAULT_BADGES) {
      const exists = await badgeRepository.findOne({
        where: { code: badge.code },
      });
      if (exists) {
        console.log(`[seed] Badge already exists: ${badge.code} (skipped)`);
        continue;
      }
      await badgeRepository.save(
        badgeRepository.create({ ...badge, isActive: true }),
      );
      console.log(`[seed] Badge created: ${badge.code}`);
    }
  } finally {
    await AppDataSource.destroy();
  }
}

void main().catch((error: unknown) => {
  console.error('[seed] Failed:', error);
  process.exit(1);
});
