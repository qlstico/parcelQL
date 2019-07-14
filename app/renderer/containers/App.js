import '../../assets/styles/App.css';
// import '../assets/css/App.css'; // css doesnt seem to want to work revisit later
import React, { useContext } from 'react';
import Routes from '../Routes';
import {
  PrimarySearchAppBar,
  // DbRelatedProvider,
  RefreshCircle,
  DbRelatedContext
} from '../components/';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
toast.configure();

const App = () => {
  const { refreshStatus } = useContext(DbRelatedContext);
  return (
    // <DbRelatedProvider>
    <div>
      <PrimarySearchAppBar />
      {refreshStatus ? <RefreshCircle /> : <Routes />}
    </div>
    // </DbRelatedProvider>
  );
};

export default App;
