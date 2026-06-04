import { MigrationInterface, QueryRunner } from "typeorm";

export class QuizModuleRedesign1780434460337 implements MigrationInterface {
    name = 'QuizModuleRedesign1780434460337'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."quiz_questions_difficulty_enum" AS ENUM('easy', 'medium', 'hard')`);
        await queryRunner.query(`CREATE TYPE "public"."quiz_questions_status_enum" AS ENUM('PENDING_REVIEW', 'ACTIVE', 'INACTIVE', 'REJECTED')`);
        await queryRunner.query(`CREATE TYPE "public"."quiz_questions_source_enum" AS ENUM('MANUAL', 'AI', 'FALLBACK')`);
        await queryRunner.query(`CREATE TABLE "quiz_questions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "topic" character varying(100) NOT NULL, "difficulty" "public"."quiz_questions_difficulty_enum" NOT NULL DEFAULT 'medium', "content" text NOT NULL, "explanation" text, "status" "public"."quiz_questions_status_enum" NOT NULL DEFAULT 'PENDING_REVIEW', "source" "public"."quiz_questions_source_enum" NOT NULL DEFAULT 'MANUAL', "created_by_id" uuid, "reviewed_by_id" uuid, "reviewed_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ec0447fd30d9f5c182e7653bfd3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "quiz_options" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question_id" uuid NOT NULL, "content" text NOT NULL, "is_correct" boolean NOT NULL DEFAULT false, "sort_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9c59607f100085ab17f0f138926" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "quiz_attempt_answers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "attempt_id" uuid NOT NULL, "question_id" uuid, "question_snapshot" jsonb, "selected_option_index" integer NOT NULL, "correct_option_index" integer NOT NULL, "is_correct" boolean NOT NULL, "explanation" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_876afc52bb7dd208ae7ce3ec6ff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "quiz_attempts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "topic_id" character varying(100) NOT NULL, "quiz_date" character varying(10) NOT NULL, "score" integer NOT NULL DEFAULT '0', "total_questions" integer NOT NULL DEFAULT '0', "points_earned" integer NOT NULL DEFAULT '0', "is_rewarded" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a84a93fb092359516dc5b325b90" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."admin_audit_action" RENAME TO "admin_audit_action_old"`);
        await queryRunner.query(`CREATE TYPE "public"."admin_audit_action" AS ENUM('USER_STATUS_CHANGE', 'USER_PROFILE_UPDATE', 'PARTNER_APPROVAL', 'PARTNER_ROLES_UPDATE', 'REWARD_CREATE', 'REWARD_UPDATE', 'REWARD_DELETE', 'REDEMPTION_STATUS_UPDATE', 'COLLECTION_POINT_CREATE', 'COLLECTION_POINT_UPDATE', 'COLLECTION_POINT_DELETE', 'FORUM_POST_DELETE', 'FORUM_COMMENT_DELETE', 'POINTS_ADJUST', 'FRAUD_STATUS_UPDATE', 'QUIZ_QUESTION_CREATE', 'QUIZ_QUESTION_UPDATE', 'QUIZ_QUESTION_DELETE', 'QUIZ_QUESTION_STATUS_UPDATE', 'QUIZ_QUESTION_GENERATE')`);
        await queryRunner.query(`ALTER TABLE "admin_audit_logs" ALTER COLUMN "action" TYPE "public"."admin_audit_action" USING "action"::"text"::"public"."admin_audit_action"`);
        await queryRunner.query(`DROP TYPE "public"."admin_audit_action_old"`);
        await queryRunner.query(`ALTER TABLE "quiz_questions" ADD CONSTRAINT "FK_66f65421ee4210c89ff4ff57912" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz_questions" ADD CONSTRAINT "FK_2e6a7113a62b11b126190d15d17" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz_options" ADD CONSTRAINT "FK_2aa44934a4602aef1ede068f4a7" FOREIGN KEY ("question_id") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "FK_5637534756d07a1f243d1517c10" FOREIGN KEY ("attempt_id") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz_attempt_answers" ADD CONSTRAINT "FK_8aece94c843ae12e0698aa3b614" FOREIGN KEY ("question_id") REFERENCES "quiz_questions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz_attempts" ADD CONSTRAINT "FK_1701aaf48f6a78e96bfe08dd395" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz_attempts" DROP CONSTRAINT "FK_1701aaf48f6a78e96bfe08dd395"`);
        await queryRunner.query(`ALTER TABLE "quiz_attempt_answers" DROP CONSTRAINT "FK_8aece94c843ae12e0698aa3b614"`);
        await queryRunner.query(`ALTER TABLE "quiz_attempt_answers" DROP CONSTRAINT "FK_5637534756d07a1f243d1517c10"`);
        await queryRunner.query(`ALTER TABLE "quiz_options" DROP CONSTRAINT "FK_2aa44934a4602aef1ede068f4a7"`);
        await queryRunner.query(`ALTER TABLE "quiz_questions" DROP CONSTRAINT "FK_2e6a7113a62b11b126190d15d17"`);
        await queryRunner.query(`ALTER TABLE "quiz_questions" DROP CONSTRAINT "FK_66f65421ee4210c89ff4ff57912"`);
        await queryRunner.query(`CREATE TYPE "public"."admin_audit_action_old" AS ENUM('USER_STATUS_CHANGE', 'USER_PROFILE_UPDATE', 'PARTNER_APPROVAL', 'PARTNER_ROLES_UPDATE', 'REWARD_CREATE', 'REWARD_UPDATE', 'REWARD_DELETE', 'REDEMPTION_STATUS_UPDATE', 'COLLECTION_POINT_CREATE', 'COLLECTION_POINT_UPDATE', 'COLLECTION_POINT_DELETE', 'FORUM_POST_DELETE', 'FORUM_COMMENT_DELETE', 'POINTS_ADJUST', 'FRAUD_STATUS_UPDATE')`);
        await queryRunner.query(`ALTER TABLE "admin_audit_logs" ALTER COLUMN "action" TYPE "public"."admin_audit_action_old" USING "action"::"text"::"public"."admin_audit_action_old"`);
        await queryRunner.query(`DROP TYPE "public"."admin_audit_action"`);
        await queryRunner.query(`ALTER TYPE "public"."admin_audit_action_old" RENAME TO "admin_audit_action"`);
        await queryRunner.query(`DROP TABLE "quiz_attempts"`);
        await queryRunner.query(`DROP TABLE "quiz_attempt_answers"`);
        await queryRunner.query(`DROP TABLE "quiz_options"`);
        await queryRunner.query(`DROP TABLE "quiz_questions"`);
        await queryRunner.query(`DROP TYPE "public"."quiz_questions_source_enum"`);
        await queryRunner.query(`DROP TYPE "public"."quiz_questions_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."quiz_questions_difficulty_enum"`);
    }

}
