import React, { useState, useEffect, useContext } from 'react';
import { DbRelatedContext, Login } from '../components/index';
import { withRouter } from 'react-router-dom';
const { encrypt } = require('../../server/util');
import { storage } from '../utils/electronImports';

const Edit = props => {
  const [thisUser, setThisUser] = useState(null);
  const [connectionsArray, setConnectionsArray] = useState(null);
  const { selectedUser, setCurrentComponent } = useContext(DbRelatedContext);

  useEffect(() => {
    setCurrentComponent('editConnection');
    storage.get('connectionData', (error, data) => {
      if (error) throw error;
      const foundUser = data.find(user => user.id === selectedUser.id);
      foundUser.password = encrypt(foundUser.password, 'decrypt');
      setThisUser(foundUser);
      setConnectionsArray(data);
    });
  }, []);

  const writeToLocalStorage = () => {
    storage.set(
      'connectionData',
      connectionsArray.map(user => {
        if (user.id === thisUser.id) {
          user = thisUser;
          user.password = encrypt(user.password, 'encrypt');
          return user;
        } else {
          return user;
        }
      }),
      function(error) {
        if (error) throw error;
        else props.history.push('/');
      }
    );
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setThisUser({ ...thisUser, [name]: value });
  };

  const handleCheckboxChange = e => {
    const { name, checked } = e.target;
    setThisUser({ ...thisUser, [name]: checked });
  };

  const handleSubmit = e => {
    e.preventDefault();
    writeToLocalStorage();
  };
  return (
    thisUser && (
      <Login
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        handleCheckboxChange={handleCheckboxChange}
        values={thisUser}
      />
    )
  );
};

export default withRouter(Edit);
