import { EntityManager } from '@mikro-orm/core';
import { AbstractSqlConnection } from '@mikro-orm/knex';

export interface Context {
    em: EntityManager;
    conn: AbstractSqlConnection;
    serverUrl: string;
}
