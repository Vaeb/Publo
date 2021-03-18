import { Entity, Property } from '@mikro-orm/core';

import { BaseEntity } from './BaseEntity';

@Entity()
export class Publication extends BaseEntity {
    @Property()
    title!: string;

    @Property()
    type!: string;

    @Property()
    volume?: string;

    @Property()
    year!: number;

    // @ManyToOne(() => Author)
    // author!: Author;
}
