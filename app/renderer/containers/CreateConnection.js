import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { electron, storage } from '../utils/electronImports';
const { ipcRenderer } = electron;
const { GET_OS_USER, GET_OS_USER_REPLY } = require('../constants/ipcNames');
import { Login } from '../components/index';
const { encrypt } = require('../../server/util');

const generateID = () => {
  return (
    '_' +
    Math.random()
      .toString(36)
      .substr(2, 9)
  );
};

const defaultConnectionSettings = {
  id: '',
  user: '',
  password: '',
  host: 'localhost',
  dbTypePassword: '',
  databaseName: ''
};

const Create = props => {
  // Generate a random id and attach to default settings object
  defaultConnectionSettings.id = generateID();

  // State to hold the new config settings
  const [newConfig, setNewConfig] = useState(null);
  // Stateful representation of file containing all saved users
  const [connectionData, setConnectionData] = useState(null);

  // Async function to retrieve OS Username as default create connection username
  async function getOSUserName() {
    await ipcRenderer.send(GET_OS_USER);
    await ipcRenderer.on(GET_OS_USER_REPLY, (event, OSusername) => {
      defaultConnectionSettings.user = OSusername;
    });
  }

  useEffect(() => {
    // call to retrieve OS Username as default
    getOSUserName();
    //setting the default obj defined as the state for the form values
    setNewConfig(defaultConnectionSettings);
    // componentDidMount -> get connection data from ls
    storage.get('connectionData', (error, data) => {
      if (error) throw error;
      setConnectionData(data);
    });
  }, []);

  const writeToLocalStorage = formData => {
    // if there is nothing in lsData, then turn form data into an array and then set it
    const newArray = Array.isArray(connectionData)
      ? connectionData.concat(formData)
      : [formData];
    storage.set('connectionData', newArray, function(error) {
      if (error) throw error;
    });
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setNewConfig({ ...newConfig, [name]: value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    newConfig.password = encrypt(newConfig.password, 'encrypt');
    writeToLocalStorage(newConfig);
    props.history.push('/');
  };
  return (
    newConfig && (
      <Login
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        values={newConfig}
      />
    )
  );
};

export default withRouter(Create);
