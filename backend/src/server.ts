// import path from 'path';
// import { makeExecutableSchema } from '@graphql-tools/schema';
// import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
// import { loadFilesSync } from '@graphql-tools/load-files';

import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import PrismaWrapper from '@prisma/client';

import typeDefs from './schema';
import resolvers from './resolvers';
import { Context } from './types';

const { PrismaClient } = PrismaWrapper;

// const typeDefs = mergeTypeDefs(loadFilesSync(path.resolve('./schema')));
// const resolvers = mergeResolvers(loadFilesSync(path.resolve('./resolvers')));

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
        res.send('Hello!');
        res.end();
    });

    app.listen({ port: 4000 }, () => {
        console.log(`Server listening @ http://localhost:4000${server.graphqlPath}`);
    });

    console.log('[SGQL] Done!');
};