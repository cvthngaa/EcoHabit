import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCorrectedBoundingBox1780769504672 implements MigrationInterface {
    name = 'AddCorrectedBoundingBox1780769504672'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "trash_classifications" ADD "corrected_bounding_box" json`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "trash_classifications" DROP COLUMN "corrected_bounding_box"`);
    }

}
