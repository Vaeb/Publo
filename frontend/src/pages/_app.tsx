import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';
import 'focus-visible/dist/focus-visible';

import client from '../apollo';
import theme from '../theme';
import GlobalStyles from '../style';

import Layout from '../components/layout/Layout';

function MyApp({ Component, pageProps }: any): React.ReactElement {
    return (
        <ApolloProvider client={client}>
            <ChakraProvider resetCSS theme={theme}>
                <GlobalStyles />
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </ChakraProvider>
        </ApolloProvider>
    );
}

export default MyApp;
