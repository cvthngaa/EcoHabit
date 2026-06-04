import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFraudFlags1780432701755 implements MigrationInterface {
    name = 'AddFraudFlags1780432701755'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."fraud_source_type" AS ENUM('COLLECTION', 'QUIZ', 'POINTS', 'REWARD', 'AI_CLASSIFICATION')`);
        await queryRunner.query(`CREATE TYPE "public"."fraud_severity" AS ENUM('LOW', 'MEDIUM', 'HIGH')`);
        await queryRunner.query(`CREATE TYPE "public"."fraud_status" AS ENUM('OPEN', 'REVIEWING', 'RESOLVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "fraud_flags" ("id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "source_type" "public"."fraud_source_type" NOT NULL, "source_id" character varying(255), "flag_code" character varying(100) NOT NULL, "description" text NOT NULL, "severity" "public"."fraud_severity" NOT NULL, "status" "public"."fraud_status" NOT NULL DEFAULT 'OPEN', "metadata" json, "reviewed_at" TIMESTAMP, "user_id" uuid, "reviewed_by_id" uuid, CONSTRAINT "PK_00fccadb758d1624e0831fe026a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3c0871fc7358244f7fac1ea11d" ON "fraud_flags" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_210cd35305195f679e5ac08708" ON "fraud_flags" ("source_type") `);
        await queryRunner.query(`CREATE INDEX "IDX_fd9ff0a52d76e90ccaa224a01b" ON "fraud_flags" ("flag_code") `);
        await queryRunner.query(`CREATE INDEX "IDX_64991cb2431fb6c479f1aedacd" ON "fraud_flags" ("status") `);
        await queryRunner.query(`ALTER TYPE "public"."admin_audit_action" RENAME TO "admin_audit_action_old"`);
        await queryRunner.query(`CREATE TYPE "public"."admin_audit_action" AS ENUM('USER_STATUS_CHANGE', 'USER_PROFILE_UPDATE', 'PARTNER_APPROVAL', 'PARTNER_ROLES_UPDATE', 'REWARD_CREATE', 'REWARD_UPDATE', 'REWARD_DELETE', 'REDEMPTION_STATUS_UPDATE', 'COLLECTION_POINT_CREATE', 'COLLECTION_POINT_UPDATE', 'COLLECTION_POINT_DELETE', 'FORUM_POST_DELETE', 'FORUM_COMMENT_DELETE', 'POINTS_ADJUST', 'FRAUD_STATUS_UPDATE')`);
        await queryRunner.query(`ALTER TABLE "admin_audit_logs" ALTER COLUMN "action" TYPE "public"."admin_audit_action" USING "action"::"text"::"public"."admin_audit_action"`);
        await queryRunner.query(`DROP TYPE "public"."admin_audit_action_old"`);
        await queryRunner.query(`ALTER TABLE "fraud_flags" ADD CONSTRAINT "FK_3c0871fc7358244f7fac1ea11dd" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fraud_flags" ADD CONSTRAINT "FK_851d8021bd7ea5416ce8aa81ab4" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fraud_flags" DROP CONSTRAINT "FK_851d8021bd7ea5416ce8aa81ab4"`);
        await queryRunner.query(`ALTER TABLE "fraud_flags" DROP CONSTRAINT "FK_3c0871fc7358244f7fac1ea11dd"`);
        await queryRunner.query(`CREATE TYPE "public"."admin_audit_action_old" AS ENUM('USER_STATUS_CHANGE', 'USER_PROFILE_UPDATE', 'PARTNER_APPROVAL', 'PARTNER_ROLES_UPDATE', 'REWARD_CREATE', 'REWARD_UPDATE', 'REWARD_DELETE', 'REDEMPTION_STATUS_UPDATE', 'COLLECTION_POINT_CREATE', 'COLLECTION_POINT_UPDATE', 'COLLECTION_POINT_DELETE', 'FORUM_POST_DELETE', 'FORUM_COMMENT_DELETE', 'POINTS_ADJUST')`);
        await queryRunner.query(`ALTER TABLE "admin_audit_logs" ALTER COLUMN "action" TYPE "public"."admin_audit_action_old" USING "action"::"text"::"public"."admin_audit_action_old"`);
        await queryRunner.query(`DROP TYPE "public"."admin_audit_action"`);
        await queryRunner.query(`ALTER TYPE "public"."admin_audit_action_old" RENAME TO "admin_audit_action"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_64991cb2431fb6c479f1aedacd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fd9ff0a52d76e90ccaa224a01b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_210cd35305195f679e5ac08708"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3c0871fc7358244f7fac1ea11d"`);
        await queryRunner.query(`DROP TABLE "fraud_flags"`);
        await queryRunner.query(`DROP TYPE "public"."fraud_status"`);
        await queryRunner.query(`DROP TYPE "public"."fraud_severity"`);
        await queryRunner.query(`DROP TYPE "public"."fraud_source_type"`);
    }

}
