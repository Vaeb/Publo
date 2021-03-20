import { Migration } from '@mikro-orm/migrations';

export class Migration20210320052525 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "publication" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" varchar(1023) not null, "type" varchar(255) not null, "year" int4 not null, "volume" varchar(255) null);');

    this.addSql('drop table if exists "_prisma_migrations" cascade;');

    this.addSql('drop table if exists "Publication" cascade;');
  }

}
