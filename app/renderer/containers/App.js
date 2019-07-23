import '../../assets/styles/App.css';
import React, { useContext } from 'react';
import Routes from '../Routes';
import {
  PrimarySearchAppBar,
  RefreshCircle,
  DbRelatedContext
} from '../components/';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
toast.configure();

const App = () => {
  const { refreshStatus } = useContext(DbRelatedContext);
  return (
    <div>
      <PrimarySearchAppBar />
      {refreshStatus ? <RefreshCircle /> : <Routes />}
    </div>
  );
};

export default App;
