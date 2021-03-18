import { ApolloClient, InMemoryCache } from '@apollo/client';

const debugging = true;

const client = new ApolloClient({
    uri: debugging ? 'http://localhost:4000/graphql' : 'http://vaeb.io:4000/graphql',
    cache: new InMemoryCache(),
});

export default client;
