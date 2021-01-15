import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import List from '../list/List';

const Routes = () => (
    <BrowserRouter>
        <Switch>
            {/* <Route path="/" exact component={Home} /> */}
            <Route path="/" exact render={() => <Redirect to="/list" />} />
            <Route path="/list" exact><List /></Route>
        </Switch>
    </BrowserRouter>
);

export default Routes;
