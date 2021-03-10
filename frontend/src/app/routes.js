import React from 'react';
import { Router, BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import Header from '../header/Header';
import Home from '../home/Home';
import Publication from '../publication/Publication';
import List from '../list/List';

const Routes = () => (
    <BrowserRouter>
        <div>
            {/* <Route path="/" exact component={Home} /> */}
            <Route path="/" render={() => <Header />} />
            <Route path="/" exact render={() => <Redirect to="/home" />} />
            <Route path="/home" exact><Home /></Route>
            <Route path="/publication/:pubId" exact><Publication /></Route>
            <Route path="/list" exact><List /></Route>
        </div>
    </BrowserRouter>
);

export default Routes;
