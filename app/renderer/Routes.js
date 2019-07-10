import React, { Component } from 'react';
import { Switch, Route } from 'react-router';
import { routeNames } from './constants/routeNames';
import {
  // Create,
  // AllDBs,
  // AllTables,
  ConnectPage,
  // IndivTable,
  // Edit,
} from './components';

class Routes extends Component {
  render() {
    return (
      <Switch>
        <Route exact path={routeNames.Connect} component={ConnectPage} />
        {/* <Route exact path={routeNames.editDB} component={Edit} /> */}
        {/* <Route exact path={routeNames.create} component={Create} /> */}
        {/* <Route exact path={routeNames.allDBs} component={AllDBs} />
        <Route exact path={routeNames.tables} component={AllTables} />
        <Route exact path={routeNames.IndivTable} component={IndivTable} /> */}
      </Switch>
    );
  }
}

export default Routes;
