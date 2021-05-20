import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import PrismaWrapper from '@prisma/client';

import typeDefs from './schema';
import resolvers from './resolvers';
import { Context } from './types';

const { PrismaClient } = PrismaWrapper;

console.log('[IORM] Initializing Prisma...');

export const prisma = new PrismaClient();

console.log('[IORM] Done!');

export const listen = async (): Promise<void> => {
    console.log('[SGQL] Starting GraphQL server...');

    const app = express();

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req }) => ({
            prisma,
            serverUrl: `${req.protocol}://${req.get('host')}`,
        } as Context),
    });

    server.applyMiddleware({ app });

    app.use((_req, res) => {
        res.status(200);
        res.send('This is not a valid API endpoint.');
        res.end();
    });

    app.listen({ port: 4000 }, () => {
        console.log(`Server listening @ http://localhost:4000${server.graphqlPath}`);
    });

    console.log('[SGQL] Done!');
};
