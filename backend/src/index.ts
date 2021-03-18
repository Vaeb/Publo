// import path from 'path';
// import { makeExecutableSchema } from '@graphql-tools/schema';
// import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
// import { loadFilesSync } from '@graphql-tools/load-files';

// import connect from './connect';
import OrmSetup from './server';

// const resetDatabase = false;

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Promise Rejection at:', p);
    console.log('Reason:', reason);
});

// const typeDefs = mergeTypeDefs(loadFilesSync(path.resolve('./schema')));
// const resolvers = mergeResolvers(loadFilesSync(path.resolve('./resolvers')));

(async () => {
    const ormSetup = new OrmSetup();
    await ormSetup.ready();
})();

// connect(resetDatabase).then((models) => {
//     console.log('(index.js) Sequelize synced');

//     const app = express();

//     const server = new ApolloServer({
//         typeDefs,
//         resolvers,
//         context: ({ req }) => ({
//             models,
//             serverUrl: `${req.protocol}://${req.get('host')}`,
//         }),
//     });

//     server.applyMiddleware({ app });

//     app.use((req, res) => {
//         res.status(200);
//         res.send('Hello!');
//         res.end();
//     });

//     app.listen({ port: 4000 }, () => {
//         console.log(`Server listening @ http://localhost:4000${server.graphqlPath}`);
//     });
// });
