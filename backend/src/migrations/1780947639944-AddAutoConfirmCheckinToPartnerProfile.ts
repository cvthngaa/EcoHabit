import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAutoConfirmCheckinToPartnerProfile1780947639944 implements MigrationInterface {
    name = 'AddAutoConfirmCheckinToPartnerProfile1780947639944'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "partner_profiles" ADD "auto_confirm_checkin" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "partner_profiles" DROP COLUMN "auto_confirm_checkin"`);
    }

}
