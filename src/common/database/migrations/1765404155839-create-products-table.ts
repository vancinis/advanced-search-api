import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductsTable1765404155839 implements MigrationInterface {
  name = 'CreateProductsTable1765404155839';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(200) NOT NULL, "description" text NOT NULL, "category" character varying(100) NOT NULL, "subcategories" text NOT NULL, "price" numeric(10,2) NOT NULL, "latitude" numeric(10,7) NOT NULL, "longitude" numeric(10,7) NOT NULL, "popularity" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_63fcb3d8806a6efd53dbc67430" ON "products" ("createdAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c3932231d2385ac248d0888d95" ON "products" ("category") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c3932231d2385ac248d0888d95"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_63fcb3d8806a6efd53dbc67430"`,
    );
    await queryRunner.query(`DROP TABLE "products"`);
  }
}
