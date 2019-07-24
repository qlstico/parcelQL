import React, { useState, useEffect, useContext } from 'react';
import {
  DisplayCard,
  DbRelatedContext,
  notifyAdded,
  notifyRemoved,
  RefreshCircle
} from '../index';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { electron } from '../../utils/electronImports';
const path = require('path');
const { ipcRenderer } = electron;
const nativeImage = electron.remote.nativeImage;
const { dialog } = electron.remote;
const iconPath = path.join('app/assets/images/db-icon.png');
const dbIcon = nativeImage.createFromPath(iconPath);
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
  DELETE_DATABASE
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
  console.log(iconPath);
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
    setAllDbNames,
    setCurrentComponent
  } = useContext(DbRelatedContext);

  // Setting up initial state values for rendering/interacting with components
  const [currentlySelected, setCurrentlySelected] = useState(false);
  const [dbToAdd, setDbToAdd] = useState(null);
  // Indirectly re-sets state to be the clicked on DB
  const enableSelected = dbName => {
    setCurrentlySelected(dbName);
  };

  // Hooks for setting/retrieving neccesary info to/from config file and context provider
  useEffect(() => {
    setCurrentComponent('alldbs');
    // componentDidMount to kill the server if it is open
    if (serverStatus) {
      ipcRenderer.send(CLOSE_SERVER);
      setServerStatus(false);
    }
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
      setAllDbNames(updatedDatabases);
    });
    notifyAdded('your PG databses', newDbName);
  };
  // when user clicks database, sends message to trigger getting the table data
  // set context with table names
  const selectDb = async dbname => {
    setSelectedDb(dbname); // set db name in context

    await ipcRenderer.send(GET_TABLE_NAMES, dbname); // message to get all table names
    await ipcRenderer.once(GET_TABLE_NAMES_REPLY, (_, tableNames) => {
      setTablesContext(tableNames);
    });
    props.history.push('/tables'); // finally push onto the next component
  };

  // Fucntion for deleting the currently selected DB
  const deleteDb = async selectedDbName => {
    if (selectedDbName) {
      await ipcRenderer.send(DELETE_DATABASE, selectedDbName);
      setAllDbNames(prevDbs => prevDbs.filter(db => db !== selectedDbName));
      setCurrentlySelected(false);
      notifyRemoved('your PG databases', selectedDbName);
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

  // Allows a pseudo loading message for a predetermined amount of time to allow
  // the app some time to retrieve larger data sets in case it doesn't do so immediately
  window.setTimeout(() => {
    const loadingOrEmpty = document.getElementById('load-or-empty');
    if (loadingOrEmpty) {
      loadingOrEmpty.innerHTML = `Couldn't find anything here!`;
    }
  }, 2500);

  return (
    <div>
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
            ) : (
              <h1 id="load-or-empty">One second please...</h1>
            )}
          </Grid>
        </Grid>
      </Grid>
      {renderMenu}
    </div>
  );
};

export default withRouter(AllDBs);
