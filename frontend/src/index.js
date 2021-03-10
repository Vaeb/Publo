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

    .scrollMargin {
        margin-right: calc(var(--scroll-width) - calc(100vw - var(--document-width)));
    }
`;

function getScrollbarWidth() {
    // Creating invisible container
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll'; // forcing scrollbar to appear
    outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
    document.body.appendChild(outer);

    // Creating inner element and placing it in the container
    const inner = document.createElement('div');
    outer.appendChild(inner);

    // Calculating difference between container's full width and the child width
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

    // Removing temporary elements from the DOM
    outer.parentNode.removeChild(outer);

    return scrollbarWidth;
}

const ScrollAdjuster = ({ children }) => {
    const scrollWidth = getScrollbarWidth(); // math min

    const htmlEl = document.documentElement;
    htmlEl.style.setProperty(
        '--scroll-width',
        `${scrollWidth}px`
    );

    // create an Observer instance
    const resizeObserver = new ResizeObserver((entries) => {
        htmlEl.style.setProperty(
            '--document-width',
            `${document.documentElement.clientWidth}px`
        );
    });

    resizeObserver.observe(document.body);

    return children;
};

const App = (
    <ScrollAdjuster>
        <ApolloProvider client={client}>
            <ChakraProvider>
                <GlobalStyles />
                <div>
                    <Routes />
                </div>
            </ChakraProvider>
        </ApolloProvider>
    </ScrollAdjuster>
);

ReactDOM.render(App, document.getElementById('root'));

reportWebVitals(console.log);
