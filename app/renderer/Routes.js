import React, { Component } from 'react';
import { Switch, Route } from 'react-router';
import { routeNames } from './constants/routeNames';
import {
  Create,
  AllDBs,
  AllTables,
  ConnectPage,
  IndivTable,
  Edit
} from './components';

class Routes extends Component {
  render() {
    return (
      <Switch>
        <Route exact path={routeNames.connect} component={ConnectPage} />
        <Route exact path={routeNames.editConnection} component={Edit} />
        <Route exact path={routeNames.createConnection} component={Create} />
        <Route exact path={routeNames.allDBs} component={AllDBs} />
        <Route exact path={routeNames.allTables} component={AllTables} />
        <Route exact path={routeNames.indivTable} component={IndivTable} />
      </Switch>
    );
  }
}

export default Routes;
