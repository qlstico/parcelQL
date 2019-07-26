import React, { useState, useEffect, useContext } from 'react';
import {
  DisplayCard,
  DbRelatedContext,
  notifyAdded,
  notifyRemoved,
  notifyError,
  RefreshCircle
} from '../index';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { electron } from '../../utils/electronImports';
import { Button, TextField } from '@material-ui/core/';
import { withRouter } from 'react-router-dom';
import Menu from '@material-ui/core/Menu';
import AddIcon from '@material-ui/icons/Add';
// For all ipcRenderer funcs
const {
  GET_TABLE_NAMES,
  GET_TABLE_NAMES_REPLY,
  CLOSE_SERVER,
  CREATE_DATABASE,
  CREATE_DATABASE_REPLY,
  DELETE_DATABASE,
  DATABASE_ERROR
} = require('../../constants/ipcNames');

//For rendering confirmation to delete prompt and injecting logo into prompt
// const path = require('path');
const { ipcRenderer } = electron;
const nativeImage = electron.remote.nativeImage;
const { dialog } = electron.remote;
const iconPath = 'app/assets/images/PURPLE_QLSticoV3.png';
const dbIcon = nativeImage.createFromPath(iconPath);

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
    setAllDbNames
  } = useContext(DbRelatedContext);

  // Setting up initial state values for rendering/interacting with components
  const [currentlySelected, setCurrentlySelected] = useState(false);
  const [dbToAdd, setDbToAdd] = useState(null);
  // Indirectly re-sets state to be the clicked on DB
  const enableSelected = dbName => {
    setCurrentlySelected(dbName);
  };

  // Error State
  const [errorMessage, setErrorMessage] = useState(null);

  // Allows a pseudo loading screen for a predetermined amount of time to allow
  // the app some time to retrieve larger data sets in case it doesn't do so immediately
  // before deciding there is nothing to display
  const [loadTimedOut, setLoadTimedOut] = useState(false);

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

  // Handles input for new DB name from create new DB pop out form
  const handleInputChange = e => {
    const { name, value } = e.target;
    setDbToAdd(value);
  };

  // Function for adding a new DB
  const createNewDatabase = async newDbName => {
    await ipcRenderer.send(CREATE_DATABASE, newDbName);
    await ipcRenderer.once(CREATE_DATABASE_REPLY, (event, updatedDatabases) => {
      if (typeof updatedDatabases === 'string') {
        if (errorMessage !== updatedDatabases) {
          notifyError(updatedDatabases);
        }
      } else {
        setAllDbNames(prevDbs => prevDbs.concat(newDbName));
        notifyAdded('your PG databses', newDbName);
      }
    });
  };
  // when user clicks database, sends message to trigger getting the table data
  // set context with table names
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
        props.history.push('/allTables'); // finally push onto the next component
      }
    });
  };

  // Fucntion for deleting the currently selected DB
  const deleteDb = async selectedDbName => {
    if (selectedDbName) {
      await ipcRenderer.send(DELETE_DATABASE, selectedDbName);
      await ipcRenderer.once(DATABASE_ERROR, (_, errorMsg) => {
        if (typeof errorMsg === 'string' && errorMessage !== errorMsg) {
          notifyError(errorMsg);
          return null;
        }
        setAllDbNames(prevDbs => prevDbs.filter(db => db !== selectedDbName));
        setCurrentlySelected(false);
        notifyRemoved('your PG databases', selectedDbName);
      });
    }
  };

  // Options object for the confirmation box
  const deleteConfirmOptions = {
    type: 'question',
    buttons: ['Yes, I do', 'Cancel'],
    defaultId: 1,
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete this database: "${currentlySelected}" ?`,
    detail:
      'This is a permanent deletion option, all information contained will be lost.',
    icon: dbIcon
  };

  // Below code responsible for MaterialUI component that handles input for creating a
  // new DB.
  const [anchorEl, setAnchorEl] = React.useState(null);
  const menuId = 'primary-search-account-menu';
  const isMenuOpen = Boolean(anchorEl);

  function handleProfileMenuOpen(event) {
    setCurrentlySelected(false);
    setAnchorEl(event.currentTarget);
  }

  function handleMenuClose() {
    setAnchorEl(null);
  }
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <div id="add_db_menu" onClick={handleProfileMenuOpen}>
        <TextField
          label="Database Name"
          name="newDbName"
          onChange={handleInputChange}
        />
        <Button
          variant="contained"
          aria-label="Add"
          color="inherit"
          onClick={() => createNewDatabase(dbToAdd)}
        >
          <AddIcon onClick={handleMenuClose} />
        </Button>
      </div>
    </Menu>
  );

  return (
    <div className="content">
      <h1>Databases: </h1>
      <Button
        edge="end"
        aria-label="create db"
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={handleProfileMenuOpen}
        color="inherit"
        id="menuButton"
      >
        Add A Database
      </Button>

      {currentlySelected && (
        <Button
          variant="contained"
          type="button"
          text="white"
          size="small"
          style={{ background: '#FF715B' }}
          // onClick={() => deleteDb(currentlySelected)}
          onClick={() =>
            dialog.showMessageBox(null, deleteConfirmOptions, response => {
              if (response === 0) {
                deleteDb(currentlySelected);
              }
            })
          }
          id="menuButton"
        >
          Remove Database
        </Button>
      )}

      <Grid container className={classes.root} spacing={3}>
        <Grid item xs={12}>
          <Grid container justify="center" spacing={spacing}>
            {allDbNames ? (
              allDbNames.map(db => (
                <Grid
                  key={db}
                  className={
                    currentlySelected === db ? classes.highlightSelected : ''
                  }
                  item
                  onClick={() => enableSelected(db)}
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
      {renderMenu}
    </div>
  );
};

export default withRouter(AllDBs);
