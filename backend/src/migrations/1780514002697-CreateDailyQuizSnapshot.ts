import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDailyQuizSnapshot1780514002697 implements MigrationInterface {
    name = 'CreateDailyQuizSnapshot1780514002697'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "daily_quiz_set_questions" DROP CONSTRAINT "FK_daily_quiz_set_questions_question_id"`);
        await queryRunner.query(`ALTER TABLE "daily_quiz_set_questions" DROP CONSTRAINT "FK_daily_quiz_set_questions_daily_quiz_set_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_daily_quiz_set_questions_daily_quiz_set_id_question_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_daily_quiz_sets_quiz_date_topic_id"`);
        await queryRunner.query(`ALTER TYPE "public"."quiz_questions_source_enum" RENAME TO "quiz_questions_source_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."quiz_questions_source_enum" AS ENUM('MANUAL', 'AI', 'FALLBACK', 'IMPORT', 'SEED')`);
        await queryRunner.query(`ALTER TABLE "quiz_questions" ALTER COLUMN "source" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "quiz_questions" ALTER COLUMN "source" TYPE "public"."quiz_questions_source_enum" USING "source"::"text"::"public"."quiz_questions_source_enum"`);
        await queryRunner.query(`ALTER TABLE "quiz_questions" ALTER COLUMN "source" SET DEFAULT 'MANUAL'`);
        await queryRunner.query(`DROP TYPE "public"."quiz_questions_source_enum_old"`);
        await queryRunner.query(`ALTER TABLE "daily_quiz_sets" DROP COLUMN "quiz_date"`);
        await queryRunner.query(`ALTER TABLE "daily_quiz_sets" ADD "quiz_date" character varying(20) NOT NULL DEFAULT '2026-06-01'`);
        await queryRunner.query(`ALTER TABLE "daily_quiz_sets" ALTER COLUMN "quiz_date" DROP DEFAULT`);
        await queryRunner.query(`CREATE INDEX "IDX_b9e393d65ab3af42147a6108dc" ON "daily_quiz_set_questions" ("daily_quiz_set_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_7d5a3067cbba85efb1b06bf4c6" ON "daily_quiz_set_questions" ("question_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_6dba6050af75bb4baf39d21d6f" ON "daily_quiz_sets" ("quiz_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_26198e5bb5a4a00b5e3d4a0f33" ON "daily_quiz_sets" ("topic_id") `);
        await queryRunner.query(`ALTER TABLE "daily_quiz_set_questions" ADD CONSTRAINT "UQ_b14ddad378fef34388aa56779c1" UNIQUE ("daily_quiz_set_id", "question_id")`);
        await queryRunner.query(`ALTER TABLE "daily_quiz_sets" ADD CONSTRAINT "UQ_ad56b45c2ec781cb2ccefd107d2" UNIQUE ("quiz_date", "topic_id")`);
        await queryRunner.query(`ALTER TABLE "daily_quiz_set_questions" ADD CONSTRAINT "FK_b9e393d65ab3af42147a6108dc8" FOREIGN KEY ("daily_quiz_set_id") REFERENCES "daily_quiz_sets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "daily_quiz_set_questions" ADD CONSTRAINT "FK_7d5a3067cbba85efb1b06bf4c62" FOREIGN KEY ("question_id") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "daily_quiz_set_questions" DROP CONSTRAINT "FK_7d5a3067cbba85efb1b06bf4c62"`);
        await queryRunner.query(`ALTER TABLE "daily_quiz_set_questions" DROP CONSTRAINT "FK_b9e393d65ab3af42147a6108dc8"`);
        await queryRunner.query(`ALTER TABLE "daily_quiz_sets" DROP CONSTRAINT "UQ_ad56b45c2ec781cb2ccefd107d2"`);
        await queryRunner.query(`ALTER TABLE "daily_quiz_set_questions" DROP CONSTRAINT "UQ_b14ddad378fef34388aa56779c1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_26198e5bb5a4a00b5e3d4a0f33"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6dba6050af75bb4baf39d21d6f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7d5a3067cbba85efb1b06bf4c6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b9e393d65ab3af42147a6108dc"`);
        await queryRunner.query(`ALTER TABLE "daily_quiz_sets" DROP COLUMN "quiz_date"`);
        await queryRunner.query(`ALTER TABLE "daily_quiz_sets" ADD "quiz_date" character varying(10) NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."quiz_questions_source_enum_old" AS ENUM('MANUAL', 'AI', 'FALLBACK')`);
        await queryRunner.query(`ALTER TABLE "quiz_questions" ALTER COLUMN "source" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "quiz_questions" ALTER COLUMN "source" TYPE "public"."quiz_questions_source_enum_old" USING "source"::"text"::"public"."quiz_questions_source_enum_old"`);
        await queryRunner.query(`ALTER TABLE "quiz_questions" ALTER COLUMN "source" SET DEFAULT 'MANUAL'`);
        await queryRunner.query(`DROP TYPE "public"."quiz_questions_source_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."quiz_questions_source_enum_old" RENAME TO "quiz_questions_source_enum"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_daily_quiz_sets_quiz_date_topic_id" ON "daily_quiz_sets" ("quiz_date", "topic_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_daily_quiz_set_questions_daily_quiz_set_id_question_id" ON "daily_quiz_set_questions" ("daily_quiz_set_id", "question_id") `);
        await queryRunner.query(`ALTER TABLE "daily_quiz_set_questions" ADD CONSTRAINT "FK_daily_quiz_set_questions_daily_quiz_set_id" FOREIGN KEY ("daily_quiz_set_id") REFERENCES "daily_quiz_sets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "daily_quiz_set_questions" ADD CONSTRAINT "FK_daily_quiz_set_questions_question_id" FOREIGN KEY ("question_id") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
