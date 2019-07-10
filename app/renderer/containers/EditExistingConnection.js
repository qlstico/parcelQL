import React, { useState, useEffect, useContext } from 'react';
import { DbRelatedContext, Login } from '../components/index';
import { withRouter } from 'react-router-dom';
const { LOGIN_FORM_DATA } = require('../constants/ipcNames');
const { encrypt } = require('../../server/util');
import { electron, storage } from '../utils/electronImports';
const { ipcRenderer } = electron;

const Edit = props => {
  const [thisUser, setThisUser] = useState(null);
  const [connectionsArray, setConnectionsArray] = useState(null);
  const { selectedUser } = useContext(DbRelatedContext);

  useEffect(() => {
    storage.get('connectionData', (error, data) => {
      if (error) throw error;
      const foundUser = data.find(user => user.id === selectedUser.id);
      // foundUser.password = encrypt(foundUser.password, 'decrypt');
      setThisUser(foundUser);
      setConnectionsArray(data);
    });
  }, []);

  const writeToLocalStorage = () => {
    storage.set(
      'connectionData',
      connectionsArray.map(user => {
        if (user.id === thisUser.id) {
          // user.password = encrypt(thisUser.password, 'encrypt');
          return user;
        } else {
          return user;
        }
      }),
      function(error) {
        if (error) throw error;
      }
    );
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setThisUser({ ...thisUser, [name]: value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    writeToLocalStorage();
    ipcRenderer.send(LOGIN_FORM_DATA, thisUser);
    props.history.push('/');
  };
  console.log({ encrypt });
  return (
    thisUser && (
      <Login
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        values={thisUser}
      />
    )
  );
};

export default withRouter(Edit);
