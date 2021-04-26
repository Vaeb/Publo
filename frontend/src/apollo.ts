import { ApolloClient, InMemoryCache } from '@apollo/client';

const webServer = false;

const client = new ApolloClient({
    uri: webServer ? 'http://vaeb.io:4000/graphql' : 'http://localhost:4000/graphql',
    cache: new InMemoryCache(),
});

export default client;
