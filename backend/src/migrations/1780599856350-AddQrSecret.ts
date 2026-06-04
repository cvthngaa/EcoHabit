import { MigrationInterface, QueryRunner } from "typeorm";

export class AddQrSecret1780599856350 implements MigrationInterface {
    name = 'AddQrSecret1780599856350'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "locations" ADD "qr_secret" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "locations" DROP COLUMN "qr_secret"`);
    }

}
