import 'reflect-metadata';
import { MikroORM, EntityManager } from '@mikro-orm/core';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';

import ormConfig from './config/mikro-orm.config';
import typeDefs from './schema';
import resolvers from './resolvers';

interface Context {
    em: EntityManager;
    serverUrl: string;
}

export default class OrmSetup {
    public orm: MikroORM;

    public app: express.Application;

    public server: ApolloServer;

    public connect = async (): Promise<void> => {
        console.log('Initializing MikroORM...');
        try { // Init's MikroORM, runs any pending migrations if necessary
            this.orm = await MikroORM.init(ormConfig);
            const migrator = this.orm.getMigrator();
            const migrations = await migrator.getPendingMigrations();
            if (migrations && migrations.length > 0) {
                await migrator.up();
            }
            console.log('[Initializing MikroORM] Done!');
        } catch (err) {
            console.error('Failed to connect to the database via MikroORM:', err);
            throw new Error(err);
        }
    };

    public listen = async (): Promise<void> => {
        console.log('Starting GraphQL server...');

        this.app = express();

        this.server = new ApolloServer({
            typeDefs,
            resolvers,
            context: ({ req }) => ({
                em: this.orm.em.fork(),
                serverUrl: `${req.protocol}://${req.get('host')}`,
            } as Context),
        });

        this.server.applyMiddleware({ app: this.app });

        this.app.use((_req, res) => {
            res.status(200);
            res.send('Hello!');
            res.end();
        });

        this.app.listen({ port: 4000 }, () => {
            console.log(`Server listening @ http://localhost:4000${this.server.graphqlPath}`);
        });

        console.log('[Starting GraphQL server] Done!');
    };

    public ready = async (): Promise<void> => {
        await this.connect();
        await this.listen();
    };
}
