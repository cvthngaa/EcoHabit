import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBadgesAndLeaderboard1781000000000 implements MigrationInterface {
  name = 'AddBadgesAndLeaderboard1781000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create enum type
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE badge_condition_type_enum AS ENUM (
          'FIRST_QUIZ_COMPLETED',
          'QUIZ_COMPLETED_COUNT',
          'CLASSIFICATION_COUNT',
          'DROPOFF_CONFIRMED_COUNT',
          'POINTS_BALANCE_REACHED'
        );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // 2. Create badges table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS badges (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code        VARCHAR(100) NOT NULL UNIQUE,
        name        VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        icon        VARCHAR(255),
        condition_type badge_condition_type_enum NOT NULL,
        threshold   INTEGER NOT NULL DEFAULT 1,
        is_active   BOOLEAN NOT NULL DEFAULT TRUE,
        created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // 3. Create user_badges table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        badge_id    UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
        awarded_at  TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE (user_id, badge_id)
      )
    `);

    // 4. Index for faster lookups
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges (user_id);
    `);

    // 5. Seed default badges
    await queryRunner.query(`
      INSERT INTO badges (code, name, description, icon, condition_type, threshold, is_active)
      VALUES
        (
          'FIRST_QUIZ',
          'Người mới xanh',
          'Hoàn thành bài quiz đầu tiên của bạn!',
          '🌱',
          'FIRST_QUIZ_COMPLETED',
          1,
          TRUE
        ),
        (
          'QUIZ_5',
          'Người học chăm chỉ',
          'Hoàn thành 5 bài quiz. Kiến thức xanh đang lớn dần!',
          '📚',
          'QUIZ_COMPLETED_COUNT',
          5,
          TRUE
        ),
        (
          'CLASSIFICATION_10',
          'Chuyên gia phân loại',
          'Đã phân loại rác 10 lần. Bạn thật sự am hiểu về môi trường!',
          '♻️',
          'CLASSIFICATION_COUNT',
          10,
          TRUE
        ),
        (
          'DROPOFF_3',
          'Người tái chế',
          'Đã giao rác thành công 3 lần tại điểm thu gom.',
          '🚮',
          'DROPOFF_CONFIRMED_COUNT',
          3,
          TRUE
        ),
        (
          'POINTS_100',
          'Tích điểm xanh',
          'Đạt 100 điểm xanh. Hành trình bảo vệ Trái Đất của bạn đang rất ấn tượng!',
          '💚',
          'POINTS_BALANCE_REACHED',
          100,
          TRUE
        )
      ON CONFLICT (code) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_user_badges_user_id`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_badges`);
    await queryRunner.query(`DROP TABLE IF EXISTS badges`);
    await queryRunner.query(`DROP TYPE IF EXISTS badge_condition_type_enum`);
  }
}
