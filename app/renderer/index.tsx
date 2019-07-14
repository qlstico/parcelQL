import * as React from 'react';
import { render } from 'react-dom';
import App from './containers/App';
import { HashRouter } from 'react-router-dom';
import { DbRelatedProvider } from './components';

// import Router from './router';

render(
  <HashRouter>
    <DbRelatedProvider>
      <App />
    </DbRelatedProvider>
  </HashRouter>,
  document.getElementById('root')
);
