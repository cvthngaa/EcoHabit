import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddThumbnailUrlToRewards1780951334000 implements MigrationInterface {
  name = 'AddThumbnailUrlToRewards1780951334000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rewards" ADD COLUMN IF NOT EXISTS "thumbnail_url" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rewards" DROP COLUMN IF EXISTS "thumbnail_url"`,
    );
  }
}
