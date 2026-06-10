import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWasteTypes1781117448477 implements MigrationInterface {
    name = 'AddWasteTypes1781117448477'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_badges" DROP CONSTRAINT "user_badges_badge_id_fkey"`);
        await queryRunner.query(`ALTER TABLE "user_badges" DROP CONSTRAINT "user_badges_user_id_fkey"`);
        await queryRunner.query(`DROP INDEX "public"."idx_user_badges_user_id"`);
        await queryRunner.query(`ALTER TABLE "user_badges" DROP CONSTRAINT "user_badges_user_id_badge_id_key"`);
        await queryRunner.query(`ALTER TABLE "locations" DROP COLUMN "qr_secret"`);
        await queryRunner.query(`ALTER TYPE "public"."waste_type" RENAME TO "waste_type_old"`);
        await queryRunner.query(`CREATE TYPE "public"."waste_type" AS ENUM('PLASTIC', 'PAPER', 'BATTERY', 'GLASS', 'METAL', 'E_WASTE', 'TEXTILE', 'OTHER')`);
        await queryRunner.query(`ALTER TABLE "ai_feedbacks" ALTER COLUMN "corrected_waste_type" TYPE "public"."waste_type" USING "corrected_waste_type"::"text"::"public"."waste_type"`);
        await queryRunner.query(`ALTER TABLE "trash_classifications" ALTER COLUMN "predicted_waste_type" TYPE "public"."waste_type" USING "predicted_waste_type"::"text"::"public"."waste_type"`);
        await queryRunner.query(`ALTER TABLE "trash_classifications" ALTER COLUMN "corrected_waste_type" TYPE "public"."waste_type" USING "corrected_waste_type"::"text"::"public"."waste_type"`);
        await queryRunner.query(`ALTER TABLE "accepted_waste_types" ALTER COLUMN "waste_type" TYPE "public"."waste_type" USING "waste_type"::"text"::"public"."waste_type"`);
        await queryRunner.query(`DROP TYPE "public"."waste_type_old"`);
        await queryRunner.query(`ALTER TABLE "badges" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TYPE "public"."badge_condition_type_enum" RENAME TO "badge_condition_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."badges_condition_type_enum" AS ENUM('FIRST_QUIZ_COMPLETED', 'QUIZ_COMPLETED_COUNT', 'CLASSIFICATION_COUNT', 'DROPOFF_CONFIRMED_COUNT', 'POINTS_BALANCE_REACHED')`);
        await queryRunner.query(`ALTER TABLE "badges" ALTER COLUMN "condition_type" TYPE "public"."badges_condition_type_enum" USING "condition_type"::"text"::"public"."badges_condition_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."badge_condition_type_enum_old"`);
        await queryRunner.query(`CREATE INDEX "IDX_f1221d9b1aaa64b1f3c98ed46d" ON "user_badges" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "user_badges" ADD CONSTRAINT "UQ_201b6e34825dc5bd06181320bde" UNIQUE ("user_id", "badge_id")`);
        await queryRunner.query(`ALTER TABLE "user_badges" ADD CONSTRAINT "FK_f1221d9b1aaa64b1f3c98ed46d3" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_badges" ADD CONSTRAINT "FK_715b81e610ab276ff6603cfc8e8" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_badges" DROP CONSTRAINT "FK_715b81e610ab276ff6603cfc8e8"`);
        await queryRunner.query(`ALTER TABLE "user_badges" DROP CONSTRAINT "FK_f1221d9b1aaa64b1f3c98ed46d3"`);
        await queryRunner.query(`ALTER TABLE "user_badges" DROP CONSTRAINT "UQ_201b6e34825dc5bd06181320bde"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f1221d9b1aaa64b1f3c98ed46d"`);
        await queryRunner.query(`CREATE TYPE "public"."badge_condition_type_enum_old" AS ENUM('FIRST_QUIZ_COMPLETED', 'QUIZ_COMPLETED_COUNT', 'CLASSIFICATION_COUNT', 'DROPOFF_CONFIRMED_COUNT', 'POINTS_BALANCE_REACHED')`);
        await queryRunner.query(`ALTER TABLE "badges" ALTER COLUMN "condition_type" TYPE "public"."badge_condition_type_enum_old" USING "condition_type"::"text"::"public"."badge_condition_type_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."badges_condition_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."badge_condition_type_enum_old" RENAME TO "badge_condition_type_enum"`);
        await queryRunner.query(`ALTER TABLE "badges" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`CREATE TYPE "public"."waste_type_old" AS ENUM('PLASTIC', 'PAPER', 'BATTERY', 'GLASS', 'METAL', 'OTHER')`);
        await queryRunner.query(`ALTER TABLE "accepted_waste_types" ALTER COLUMN "waste_type" TYPE "public"."waste_type_old" USING "waste_type"::"text"::"public"."waste_type_old"`);
        await queryRunner.query(`ALTER TABLE "trash_classifications" ALTER COLUMN "corrected_waste_type" TYPE "public"."waste_type_old" USING "corrected_waste_type"::"text"::"public"."waste_type_old"`);
        await queryRunner.query(`ALTER TABLE "trash_classifications" ALTER COLUMN "predicted_waste_type" TYPE "public"."waste_type_old" USING "predicted_waste_type"::"text"::"public"."waste_type_old"`);
        await queryRunner.query(`ALTER TABLE "ai_feedbacks" ALTER COLUMN "corrected_waste_type" TYPE "public"."waste_type_old" USING "corrected_waste_type"::"text"::"public"."waste_type_old"`);
        await queryRunner.query(`DROP TYPE "public"."waste_type"`);
        await queryRunner.query(`ALTER TYPE "public"."waste_type_old" RENAME TO "waste_type"`);
        await queryRunner.query(`ALTER TABLE "locations" ADD "qr_secret" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_badge_id_key" UNIQUE ("user_id", "badge_id")`);
        await queryRunner.query(`CREATE INDEX "idx_user_badges_user_id" ON "user_badges" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
