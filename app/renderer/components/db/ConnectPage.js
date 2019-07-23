import React, { useState, useEffect, useContext } from 'react';
import { DbRelatedContext, notifyError, notifyRemoved } from '../index';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { electron, storage } from '../../utils/electronImports';
const { ipcRenderer } = electron;
const {
  CLOSE_SERVER,
  GET_DB_NAMES,
  GET_DB_NAMES_REPLY,
  SET_USER_DB_CONNECTION
} = require('../../constants/ipcNames');

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  control: {
    padding: theme.spacing(2)
  },
  card: {
    height: 150,
    width: 1000
  },
  pos: {
    marginBottom: 0
  }
}));

const ConnectPage = props => {
  // State for user configuration
  const [userConfigs, setUserConfigs] = useState(null);
  // Error State
  const [errorMessage, setErrorMessage] = useState(null);

  const [spacing] = useState(2);
  const classes = useStyles();
  const {
    setSelectedUser,
    serverStatus,
    setServerStatus,
    setAllDbNames,
    setCurrentComponent,
    setCurrentUser
  } = useContext(DbRelatedContext);

  const existingConnections = () => {
    storage.get('connectionData', (error, data) => {
      if (error) throw error;
      setUserConfigs(data);
    });
    return userConfigs;
  };

  useEffect(() => {
    setCurrentComponent('connect');
    existingConnections();
    if (serverStatus) {
      ipcRenderer.send(CLOSE_SERVER);
      setServerStatus(false);
    }
  }, [serverStatus]);

  const removeConnection = (id, user) => {
    const connectionsAfterRemove = userConfigs.filter(
      connection => connection.id !== id
    );
    setUserConfigs(connectionsAfterRemove);
    storage.set('connectionData', connectionsAfterRemove, function(error) {
      if (error) throw error;
    });
    notifyRemoved('saved Connections', `${user}`);
  };

  const setUserDbConnection = async userConfig => {
    await ipcRenderer.send(SET_USER_DB_CONNECTION, userConfig);
  };

  const getAllDbNames = async () => {
    await ipcRenderer.send(GET_DB_NAMES);
    await ipcRenderer.once(GET_DB_NAMES_REPLY, (_, dbResponse) => {
      // checks to see if response is a string b/c we expect an array and a string
      // means we've instead returned the error message from the back end
      if (typeof dbResponse === 'string') {
        if (errorMessage !== dbResponse) {
          // notify user of the error that occured in trying to connect, and do not
          // allow to next page
          notifyError(dbResponse);
        }
      } else {
        // on successful connection and db names response, set provider state with
        // these db names and allow to move forward to next component.
        setAllDbNames(dbResponse);
        props.history.push('/dbs');
      }
    });
  };

  const handleConnect = userConfig => {
    setCurrentUser(userConfig);
    setUserDbConnection(userConfig);
    getAllDbNames();
  };
  return (
    <div>
      <h1>
        Connect:{' '}
        <Button
          onClick={() => props.history.push('/create')}
          size="large"
          align-self="right"
        >
          Create Connection
        </Button>
      </h1>
      <Grid container className={classes.root} spacing={3}>
        <Grid item xs={12}>
          <Grid container justify="space-between" spacing={spacing}>
            {Array.isArray(userConfigs) &&
              userConfigs.map(connection => (
                <Card className={classes.card} key={`${connection.id}`}>
                  <CardContent>
                    <Typography
                      className={classes.pos}
                      align="left"
                      color="textSecondary"
                    >
                      User: {connection.user}
                    </Typography>
                    <Typography
                      className={classes.pos}
                      align="left"
                      color="textSecondary"
                    >
                      Host: {connection.host}
                    </Typography>
                    <Button
                      onClick={() => handleConnect(connection)}
                      size="large"
                    >
                      Connect
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedUser(connection);
                        props.history.push('/edit');
                      }}
                      size="large"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() =>
                        removeConnection(connection.id, connection.user)
                      }
                      size="large"
                    >
                      Remove
                    </Button>
                  </CardContent>
                  <CardActions />
                </Card>
              ))}
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default ConnectPage;
