import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from '@apollo/client';

import './index.css';
import reportWebVitals from './reportWebVitals';
import client from './apollo';
import Routes from './app/routes';

const App = (
    <ApolloProvider client={client}>
        <div>
            <Routes />
        </div>
    </ApolloProvider>
);

ReactDOM.render(App, document.getElementById('root'));

reportWebVitals(console.log);
