import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, Index } from 'typeorm';

@Entity()
export class CacheEntity {
  @PrimaryColumn()
  @Index("cache_key_index")
  key: string;

  @Column({ type: 'json'})
  data: object;
}
/*
CREATE UNLOGGED TABLE "cache_entity" (
        "key" character varying NOT NULL,
        "data" json NOT NULL,
        CONSTRAINT "PK_cache_entity_key" PRIMARY KEY ("key")
      );
CREATE INDEX "cache_key_index" ON "cache_entity" ("key")
 */


//TODO add time and expiration time

