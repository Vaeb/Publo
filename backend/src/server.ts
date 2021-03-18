// import path from 'path';
// import { makeExecutableSchema } from '@graphql-tools/schema';
// import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
// import { loadFilesSync } from '@graphql-tools/load-files';

import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { AbstractSqlConnection } from '@mikro-orm/knex';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';

import ormConfig from './config/mikro-orm.config';
import typeDefs from './schema';
import resolvers from './resolvers';
import { Context } from './types';

// const typeDefs = mergeTypeDefs(loadFilesSync(path.resolve('./schema')));
// const resolvers = mergeResolvers(loadFilesSync(path.resolve('./resolvers')));

console.log('[IORM] Initializing MikroORM...');

export const orm = await MikroORM.init(ormConfig);

export const conn = orm.em.getConnection() as AbstractSqlConnection;

try {
    const migrator = orm.getMigrator();
    const migrations = await migrator.getPendingMigrations();
    if (migrations && migrations.length > 0) {
        console.log('[FDM] Found database migrations, running...');
        await migrator.up();
        console.log('[FDM] Done!');
    }
} catch (err) {
    console.error('[FDM] Failed to run database migrations:');
    throw new Error(err);
}

console.log('[IORM] Done!');

export const listen = async (): Promise<void> => {
    console.log('[SGQL] Starting GraphQL server...');

    const app = express();

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req }) => ({
            em: orm.em.fork(),
            conn,
            serverUrl: `${req.protocol}://${req.get('host')}`,
        } as Context),
    });

    server.applyMiddleware({ app });

    app.use((_req, res) => {
        res.status(200);
        res.send('Hello!');
        res.end();
    });

    app.listen({ port: 4000 }, () => {
        console.log(`Server listening @ http://localhost:4000${server.graphqlPath}`);
    });

    console.log('[SGQL] Done!');
};
