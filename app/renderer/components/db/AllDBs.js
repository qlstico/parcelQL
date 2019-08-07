import React, { useState, useEffect, useContext } from 'react';
import {
  DisplayCard,
  DbRelatedContext,
  notifyError,
  RefreshCircle
} from '../index';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { electron } from '../../utils/electronImports';
const { ipcRenderer } = electron;
import { withRouter } from 'react-router-dom';
// For all ipcRenderer funcs
const {
  GET_TABLE_NAMES,
  GET_TABLE_NAMES_REPLY,
  CLOSE_SERVER
} = require('../../constants/ipcNames');

// For styling MaterialUI components
const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  control: {
    padding: theme.spacing(2)
  },
  highlightSelected: {
    background: 'grey'
  }
}));

const AllDBs = props => {
  // For styling:
  const classes = useStyles();
  const [spacing] = useState(2);

  // Getting relevant information from context provider component
  const {
    setTables: setTablesContext,
    setSelectedDb,
    serverStatus,
    setServerStatus,
    allDbNames,
    currentlyHighlightedDb,
    setCurrentlyHighlightedDb
  } = useContext(DbRelatedContext);

  // Allows a pseudo loading screen for a predetermined amount of time to allow
  // the app some time to retrieve larger data sets in case it doesn't do so immediately
  // before deciding there is nothing to display
  const [loadTimedOut, setLoadTimedOut] = useState(false);

  // Error State
  const [errorMessage, setErrorMessage] = useState(null);

  // Hooks for setting/retrieving neccesary info to/from config file and context provider
  useEffect(() => {
    // If the requested data comes back empty, start a timer to render a loading screen
    // and if the elapsed amount of time is passed, we render a message that this data view
    // is empty
    let startTimeout;
    if (!allDbNames.length) {
      startTimeout = setTimeout(() => {
        if (!loadTimedOut) {
          setLoadTimedOut(true);
        }
      }, 2500);
    }
    // componentDidMount to kill the server if it is open
    if (serverStatus) {
      ipcRenderer.send(CLOSE_SERVER);
      setServerStatus(false);
    }

    // If and when the data requeted does finally come through, we remove the countdown
    // for the loading screen
    if (allDbNames.length) clearTimeout(startTimeout);
  }, [serverStatus, allDbNames]);

  // when user double clicks a database, sends message to trigger getting the table data
  // and set context with table names
  const selectDb = async dbname => {
    setSelectedDb(dbname); // set db name in context

    await ipcRenderer.send(GET_TABLE_NAMES, dbname); // message to get all table names
    await ipcRenderer.once(GET_TABLE_NAMES_REPLY, (_, tablesResponse) => {
      // checks to see if response is a string b/c we expect an array and a string
      // means we've instead returned the error message from the back end
      if (typeof tablesResponse === 'string') {
        if (errorMessage !== tablesResponse) {
          // notify user of the error that occured in trying to connect, and do not
          // allow to next page
          notifyError(tablesResponse);
        }
      } else {
        // on successful connection and table names response, set provider state with
        // these table names and allow to move forward to next component.
        setTablesContext(tablesResponse);
        setCurrentlyHighlightedDb(null);
        props.history.push('/allTables'); // finally push onto the next component
      }
    });
  };

  return (
    <div className="content">
      <h1 style={{ padding: '15px' }}>Databases: </h1>

      <Grid container className={classes.root}>
        <Grid item xs={12}>
          <Grid container justify="start" spacing={spacing}>
            {allDbNames ? (
              allDbNames.map(db => (
                <Grid
                  key={db}
                  className={
                    currentlyHighlightedDb === db
                      ? classes.highlightSelected
                      : ''
                  }
                  item
                  onClick={() => setCurrentlyHighlightedDb(db)}
                  onDoubleClick={() => selectDb(db)}
                >
                  <DisplayCard
                    className={classes.control}
                    name={db}
                    type="db"
                  />
                </Grid>
              ))
            ) : loadTimedOut === true ? (
              <h1 id="load-or-empty">Couldn't find anything here!</h1>
            ) : (
              <RefreshCircle />
            )}
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default withRouter(AllDBs);
