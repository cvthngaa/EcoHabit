import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLocationAvatarUrl1781474824837 implements MigrationInterface {
    name = 'AddLocationAvatarUrl1781474824837'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "locations" ADD "avatar_url" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "locations" DROP COLUMN "avatar_url"`);
    }

}
