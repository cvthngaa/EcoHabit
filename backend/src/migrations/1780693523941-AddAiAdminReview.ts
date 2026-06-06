import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAiAdminReview1780693523941 implements MigrationInterface {
    name = 'AddAiAdminReview1780693523941'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "trash_classifications" ADD "reviewed_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "trash_classifications" ADD "review_note" text`);
        await queryRunner.query(`ALTER TABLE "trash_classifications" ADD "corrected_label" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "trash_classifications" ADD "corrected_waste_type" "public"."waste_type"`);
        await queryRunner.query(`ALTER TABLE "trash_classifications" ADD "corrected_bin" "public"."bin_type"`);
        await queryRunner.query(`ALTER TABLE "trash_classifications" ADD "reviewed_by_id" uuid`);
        await queryRunner.query(`ALTER TYPE "public"."admin_audit_action" RENAME TO "admin_audit_action_old"`);
        await queryRunner.query(`CREATE TYPE "public"."admin_audit_action" AS ENUM('USER_STATUS_CHANGE', 'USER_PROFILE_UPDATE', 'PARTNER_APPROVAL', 'PARTNER_ROLES_UPDATE', 'REWARD_CREATE', 'REWARD_UPDATE', 'REWARD_DELETE', 'REDEMPTION_STATUS_UPDATE', 'COLLECTION_POINT_CREATE', 'COLLECTION_POINT_UPDATE', 'COLLECTION_POINT_DELETE', 'FORUM_POST_DELETE', 'FORUM_COMMENT_DELETE', 'POINTS_ADJUST', 'FRAUD_STATUS_UPDATE', 'QUIZ_QUESTION_CREATE', 'QUIZ_QUESTION_UPDATE', 'QUIZ_QUESTION_DELETE', 'QUIZ_QUESTION_STATUS_UPDATE', 'QUIZ_QUESTION_GENERATE', 'QUIZ_QUESTION_IMPORT', 'AI_CLASSIFICATION_REVIEW')`);
        await queryRunner.query(`ALTER TABLE "admin_audit_logs" ALTER COLUMN "action" TYPE "public"."admin_audit_action" USING "action"::"text"::"public"."admin_audit_action"`);
        await queryRunner.query(`DROP TYPE "public"."admin_audit_action_old"`);
        await queryRunner.query(`ALTER TYPE "public"."quiz_questions_difficulty_enum" RENAME TO "quiz_questions_difficulty_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."quiz_questions_difficulty_enum" AS ENUM('easy', 'medium', 'hard', 'mixed')`);
        await queryRunner.query(`ALTER TABLE "quiz_questions" ALTER COLUMN "difficulty" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "quiz_questions" ALTER COLUMN "difficulty" TYPE "public"."quiz_questions_difficulty_enum" USING "difficulty"::"text"::"public"."quiz_questions_difficulty_enum"`);
        await queryRunner.query(`ALTER TABLE "quiz_questions" ALTER COLUMN "difficulty" SET DEFAULT 'medium'`);
        await queryRunner.query(`DROP TYPE "public"."quiz_questions_difficulty_enum_old"`);
        await queryRunner.query(`ALTER TABLE "trash_classifications" ADD CONSTRAINT "FK_687ca1393579c1564f3a560d2fd" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "trash_classifications" DROP CONSTRAINT "FK_687ca1393579c1564f3a560d2fd"`);
        await queryRunner.query(`CREATE TYPE "public"."quiz_questions_difficulty_enum_old" AS ENUM('easy', 'medium', 'hard')`);
        await queryRunner.query(`ALTER TABLE "quiz_questions" ALTER COLUMN "difficulty" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "quiz_questions" ALTER COLUMN "difficulty" TYPE "public"."quiz_questions_difficulty_enum_old" USING "difficulty"::"text"::"public"."quiz_questions_difficulty_enum_old"`);
        await queryRunner.query(`ALTER TABLE "quiz_questions" ALTER COLUMN "difficulty" SET DEFAULT 'medium'`);
        await queryRunner.query(`DROP TYPE "public"."quiz_questions_difficulty_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."quiz_questions_difficulty_enum_old" RENAME TO "quiz_questions_difficulty_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."admin_audit_action_old" AS ENUM('USER_STATUS_CHANGE', 'USER_PROFILE_UPDATE', 'PARTNER_APPROVAL', 'PARTNER_ROLES_UPDATE', 'REWARD_CREATE', 'REWARD_UPDATE', 'REWARD_DELETE', 'REDEMPTION_STATUS_UPDATE', 'COLLECTION_POINT_CREATE', 'COLLECTION_POINT_UPDATE', 'COLLECTION_POINT_DELETE', 'FORUM_POST_DELETE', 'FORUM_COMMENT_DELETE', 'POINTS_ADJUST', 'FRAUD_STATUS_UPDATE', 'QUIZ_QUESTION_CREATE', 'QUIZ_QUESTION_UPDATE', 'QUIZ_QUESTION_DELETE', 'QUIZ_QUESTION_STATUS_UPDATE', 'QUIZ_QUESTION_GENERATE')`);
        await queryRunner.query(`ALTER TABLE "admin_audit_logs" ALTER COLUMN "action" TYPE "public"."admin_audit_action_old" USING "action"::"text"::"public"."admin_audit_action_old"`);
        await queryRunner.query(`DROP TYPE "public"."admin_audit_action"`);
        await queryRunner.query(`ALTER TYPE "public"."admin_audit_action_old" RENAME TO "admin_audit_action"`);
        await queryRunner.query(`ALTER TABLE "trash_classifications" DROP COLUMN "reviewed_by_id"`);
        await queryRunner.query(`ALTER TABLE "trash_classifications" DROP COLUMN "corrected_bin"`);
        await queryRunner.query(`ALTER TABLE "trash_classifications" DROP COLUMN "corrected_waste_type"`);
        await queryRunner.query(`ALTER TABLE "trash_classifications" DROP COLUMN "corrected_label"`);
        await queryRunner.query(`ALTER TABLE "trash_classifications" DROP COLUMN "review_note"`);
        await queryRunner.query(`ALTER TABLE "trash_classifications" DROP COLUMN "reviewed_at"`);
    }

}
