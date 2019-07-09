import * as React from 'react';
import { render } from 'react-dom';
import App from './containers/App';
import { HashRouter } from 'react-router-dom';

// import Router from './router';

render(
  <HashRouter>
    <App />
  </HashRouter>,
  document.getElementById('root')
);
