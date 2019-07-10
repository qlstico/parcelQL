import '../../assets/styles/App.css';
// import '../assets/css/App.css'; // css doesnt seem to want to work revisit later
import React, { Component } from 'react';
import Routes from '../Routes';
import { PrimarySearchAppBar, DbRelatedProvider } from '../components/';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
toast.configure();

class App extends Component {
  render() {
    return (
      <DbRelatedProvider>
        <div>
          <PrimarySearchAppBar />
          <Routes />
        </div>
      </DbRelatedProvider>
    );
  }
}

export default App;
