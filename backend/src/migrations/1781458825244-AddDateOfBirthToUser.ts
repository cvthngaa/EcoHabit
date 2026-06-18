import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDateOfBirthToUser1781458825244 implements MigrationInterface {
    name = 'AddDateOfBirthToUser1781458825244'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "date_of_birth" date`);
        await queryRunner.query(`ALTER TYPE "public"."admin_audit_action" RENAME TO "admin_audit_action_old"`);
        await queryRunner.query(`CREATE TYPE "public"."admin_audit_action" AS ENUM('USER_STATUS_CHANGE', 'USER_PROFILE_UPDATE', 'PARTNER_APPROVAL', 'PARTNER_ROLES_UPDATE', 'REWARD_CREATE', 'REWARD_UPDATE', 'REWARD_DELETE', 'REDEMPTION_STATUS_UPDATE', 'COLLECTION_POINT_CREATE', 'COLLECTION_POINT_UPDATE', 'COLLECTION_POINT_DELETE', 'POINTS_ADJUST', 'FRAUD_STATUS_UPDATE', 'QUIZ_QUESTION_CREATE', 'QUIZ_QUESTION_UPDATE', 'QUIZ_QUESTION_DELETE', 'QUIZ_QUESTION_STATUS_UPDATE', 'QUIZ_QUESTION_GENERATE', 'QUIZ_QUESTION_IMPORT', 'AI_CLASSIFICATION_REVIEW')`);
        await queryRunner.query(`ALTER TABLE "admin_audit_logs" ALTER COLUMN "action" TYPE "public"."admin_audit_action" USING "action"::"text"::"public"."admin_audit_action"`);
        await queryRunner.query(`DROP TYPE "public"."admin_audit_action_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."admin_audit_action_old" AS ENUM('USER_STATUS_CHANGE', 'USER_PROFILE_UPDATE', 'PARTNER_APPROVAL', 'PARTNER_ROLES_UPDATE', 'REWARD_CREATE', 'REWARD_UPDATE', 'REWARD_DELETE', 'REDEMPTION_STATUS_UPDATE', 'COLLECTION_POINT_CREATE', 'COLLECTION_POINT_UPDATE', 'COLLECTION_POINT_DELETE', 'FORUM_POST_DELETE', 'FORUM_COMMENT_DELETE', 'POINTS_ADJUST', 'FRAUD_STATUS_UPDATE', 'QUIZ_QUESTION_CREATE', 'QUIZ_QUESTION_UPDATE', 'QUIZ_QUESTION_DELETE', 'QUIZ_QUESTION_STATUS_UPDATE', 'QUIZ_QUESTION_GENERATE', 'QUIZ_QUESTION_IMPORT', 'AI_CLASSIFICATION_REVIEW')`);
        await queryRunner.query(`ALTER TABLE "admin_audit_logs" ALTER COLUMN "action" TYPE "public"."admin_audit_action_old" USING "action"::"text"::"public"."admin_audit_action_old"`);
        await queryRunner.query(`DROP TYPE "public"."admin_audit_action"`);
        await queryRunner.query(`ALTER TYPE "public"."admin_audit_action_old" RENAME TO "admin_audit_action"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "date_of_birth"`);
    }

}
