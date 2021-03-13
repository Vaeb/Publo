import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';
import 'focus-visible/dist/focus-visible';

import './index.css';
import reportWebVitals from './reportWebVitals';
import client from './apollo';
import Routes from './app/routes';
import theme from './theme';
import GlobalStyles from './style';

const App = (
    <ApolloProvider client={client}>
        <ChakraProvider theme={theme}>
            <GlobalStyles />
            <div>
                <Routes />
            </div>
        </ChakraProvider>
    </ApolloProvider>
);

ReactDOM.render(App, document.getElementById('root'));

// reportWebVitals(console.log);
