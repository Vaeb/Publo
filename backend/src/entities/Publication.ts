import { Entity, Property } from '@mikro-orm/core';

import { BaseEntity } from './BaseEntity';

@Entity()
export class Publication extends BaseEntity {
    @Property({ length: 1023 })
    title!: string;

    @Property()
    type!: string;

    @Property()
    year!: number;

    @Property({ nullable: true })
    volume?: string;

    // @ManyToMany(() => Author)
    // authors = new Collection<Author>(this);

    constructor(title: string, type: string, year: number, volume?: string) {
        super();
        this.title = title;
        this.type = type;
        this.year = year;
        if (volume !== undefined) this.volume = volume;
    }
}
