import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';
import { createGlobalStyle } from 'styled-components';
import 'focus-visible/dist/focus-visible';

import './index.css';
import reportWebVitals from './reportWebVitals';
import client from './apollo';
import Routes from './app/routes';

const GlobalStyles = createGlobalStyle`
    html {
        overflow-x: hidden;
        margin-right: calc(-1 * (100vw - 100%));
    }

    body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        line-height: 1.5715;
    }

    code {
        font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace;
    }

    .js-focus-visible :focus:not([data-focus-visible-added]) {
        outline: none;
        box-shadow: none;
    }
`;

const App = (
    <ApolloProvider client={client}>
        <ChakraProvider>
            <GlobalStyles />
            <div>
                <Routes />
            </div>
        </ChakraProvider>
    </ApolloProvider>
);

ReactDOM.render(App, document.getElementById('root'));

reportWebVitals(console.log);
