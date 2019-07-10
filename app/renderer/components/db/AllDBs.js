import React, { useState, useEffect, useContext } from 'react';
import {
  DisplayCard,
  DbRelatedContext,
  notifyAdded,
  notifyRemoved,
} from '../index';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import { electron } from '../../utils/electronImports';
const { ipcRenderer } = electron;
import { Button, TextField } from '@material-ui/core/';
import { withRouter } from 'react-router-dom';
import Menu from '@material-ui/core/Menu';
import AddIcon from '@material-ui/icons/Add';

const {
  GET_TABLE_NAMES,
  GET_TABLE_NAMES_REPLY,
  CLOSE_SERVER,
  CREATE_DATABASE,
  CREATE_DATABASE_REPLY,
  DELETE_DATABASE,
  DELETE_DATABASE_REPLY,
} = require('../../constants/ipcNames');

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  control: {
    padding: theme.spacing(2),
  },
  highlightSelected: {
    background: 'grey',
  },
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
    setAllDbNames,
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
    // componentDidMount to kill the server if it is open
    if (serverStatus) {
      ipcRenderer.send(CLOSE_SERVER);
      setServerStatus(false);
    }
  }, [serverStatus]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    setDbToAdd(value);
  };

  const createNewDatabase = async newDbName => {
    await ipcRenderer.send(CREATE_DATABASE, newDbName);
    await ipcRenderer.on(CREATE_DATABASE_REPLY, (event, updatedDatabases) => {
      setAllDbNames(updatedDatabases);
    });
    notifyAdded('your PG databses', newDbName);
  };
  // when user clicks database, sends message to trigger getting the table data
  // set context with table names
  const selectDb = async dbname => {
    setSelectedDb(dbname); // set db name in context

    await ipcRenderer.send(GET_TABLE_NAMES, dbname); // message to get all table names
    await ipcRenderer.on(GET_TABLE_NAMES_REPLY, (_, tableNames) => {
      setTablesContext(tableNames);
    });
    props.history.push('/tables'); // finally push onto the next component
  };

  const deleteDb = async selectedDbName => {
    if (selectedDbName) {
      await ipcRenderer.send(DELETE_DATABASE, selectedDbName);
      await ipcRenderer.on(DELETE_DATABASE_REPLY, (event, updatedDatabases) => {
        setAllDbNames(updatedDatabases);
      });
      setCurrentlySelected(false);
      notifyRemoved('your PG databases', selectedDbName);
    }
  };

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
  console.log({ allDbNames });
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
          onClick={() => deleteDb(currentlySelected)}
          id="menuButton"
        >
          Remove Database
        </Button>
      )}

      <Grid container className={classes.root} spacing={3}>
        <Grid item xs={12}>
          <Grid container justify="center" spacing={spacing}>
            {allDbNames
              ? allDbNames.map(db => (
                  <Grid
                    key={db}
                    className={
                      currentlySelected === db ? classes.highlightSelected : ''
                    }
                    item
                    onClick={() => enableSelected(db)}
                    onDoubleClick={() => selectDb(db)}
                  >
                    {db}
                    <DisplayCard
                      className={classes.control}
                      name={db}
                      type="db"
                    />
                  </Grid>
                ))
              : 'Loading'}
            {/* {allDbNames && allDbNames.map(db => <li>db</li>)} */}
          </Grid>
        </Grid>
      </Grid>
      {renderMenu}
    </div>
  );
};

export default withRouter(AllDBs);
