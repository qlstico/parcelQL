import React, { useState, useContext, useEffect } from 'react';
import {
  DisplayCard,
  DbRelatedContext,
  GraphQLDisplayCard,
  VoyagerDisplayCard,
  notifyRemoved,
  notifyAdded
} from '../index';
const path = require('path');
import Grid from '@material-ui/core/Grid';
import { withRouter } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { electron } from '../../utils/electronImports';
const { ipcRenderer } = electron;
const nativeImage = electron.remote.nativeImage;
const { dialog } = electron.remote;
const iconPath = path.join('app/assets/images/table-icon.png');
const tableIcon = nativeImage.createFromPath(iconPath);
import { Button, TextField } from '@material-ui/core/';
import Menu from '@material-ui/core/Menu';
import AddIcon from '@material-ui/icons/Add';

// For all ipcRenderer funcs
const {
  GET_TABLE_CONTENTS,
  GET_TABLE_CONTENTS_REPLY,
  CREATE_TABLE,
  CREATE_TABLE_REPLY,
  DELETE_TABLE,
  DELETE_TABLE_REPLY
} = require('../../constants/ipcNames');

// For styling MaterialUI components
const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  control: {
    padding: theme.spacing(2)
  },
  // This is how selected rows get their grey color set by assinging this as classname
  highlightSelected: {
    background: 'grey'
  }
}));

const AllTables = props => {
  // FOr styling:
  const classes = useStyles();
  const [spacing] = useState(2);

  // Getting relevant information from context provider component
  const {
    tables: tablesContext,
    setTables: setTablesContext,
    selectedDb,
    setSelectedTableData,
    setServerStatus,
    setSelectedTable,
    setCurrentTable,
    setCurrentComponent
  } = useContext(DbRelatedContext);

  // Sets and stores values provided from "add table" field
  const [tableToAdd, setTableToAdd] = useState(null);
  const handleInputChange = e => {
    const { name, value } = e.target;
    setTableToAdd(value);
  };

  // Managed which table is 'currently selected'
  const [currentlySelected, setCurrentlySelected] = useState(false);
  const enableSelected = tableName => {
    setCurrentlySelected(tableName);
  };

  // Retrieves the tables data from the double clicked table icon
  const getTableContents = async table => {
    // Clears table data in case it takes a minute to retrieve new data and previously
    // selected table data is still in the provider, causing old data to render temporariliy
    setSelectedTableData([]);
    // For provider to know what table to execute backend functions on
    setSelectedTable(table);
    // For breadcrumbs to access current table name
    setCurrentTable(table);
    await ipcRenderer.send(GET_TABLE_CONTENTS, [table, selectedDb]);
    await ipcRenderer.once(GET_TABLE_CONTENTS_REPLY, (event, tableData) => {
      setSelectedTableData(tableData);
    });
    props.history.push('/single');
  };

  // function for creating table via GUI
  const createNewTable = async (currentDb, newTableName) => {
    if (newTableName) {
      await ipcRenderer.send(CREATE_TABLE, [currentDb, newTableName]);
      await ipcRenderer.once(CREATE_TABLE_REPLY, (event, updatedTables) => {
        setTablesContext(updatedTables);
      });
      notifyAdded(currentDb, newTableName);
    }
  };

  // function for deleting table via the GUI
  const deleteTable = async (currentDb, selectedTableName) => {
    if (selectedTableName) {
      await ipcRenderer.send(DELETE_TABLE, [currentDb, selectedTableName]);
      setTablesContext(prevTables =>
        prevTables.filter(table => table !== selectedTableName)
      );
      setCurrentlySelected(false);
    }
    notifyRemoved(currentDb, selectedTableName);
  };

  // Options object for the confirmation box
  const deleteConfirmOptions = {
    type: 'question',
    buttons: ['Yes, I do', 'Cancel'],
    defaultId: 1,
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete this table: "${currentlySelected}" ?`,
    detail:
      'This is a permanent deletion option, all information contained will be lost.',
    icon: tableIcon
  };

  // Handles components for pop-out 'add table' component
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
          label="Add New Table"
          name="newTableName"
          onChange={handleInputChange}
        />
        <Button
          variant="contained"
          type="button"
          color="inherit"
          size="small"
          onClick={() => createNewTable(selectedDb, tableToAdd)}
        >
          <AddIcon onClick={handleMenuClose} />
        </Button>
      </div>
    </Menu>
  );

  // Send provider a true value to kick on server
  useEffect(() => {
    setCurrentComponent('alltables');

    setServerStatus(true);
    //listens for rerender when anything in the tables context provider changes,
    // i.e. a table is added or removed
  }, [tablesContext]);

  // Allows a pseudo loading message for a predetermined amount of time to allow
  // the app some time to retrieve larger data sets in case it doesn't do so immediately
  // before deciding there is nothing to display
  window.setTimeout(() => {
    const loadingOrEmpty = document.getElementById('load-or-empty');
    if (loadingOrEmpty) {
      loadingOrEmpty.innerHTML = `Couldn't find anything here!`;
    }
  }, 2500);

  return (
    <div>
      <h1>GraphQL Tools: </h1>
      <GraphQLDisplayCard />
      <VoyagerDisplayCard />
      <h1>Tables: </h1>
      <Button
        edge="end"
        aria-label="create db"
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={handleProfileMenuOpen}
        color="inherit"
        id="menuButton"
      >
        Add A Table
      </Button>
      {currentlySelected && (
        <Button
          variant="contained"
          type="button"
          text="white"
          size="small"
          style={{ background: '#FF715B' }}
          // onClick={() => deleteTable(selectedDb, currentlySelected)}
          onClick={() =>
            dialog.showMessageBox(null, deleteConfirmOptions, response => {
              if (response === 0) {
                deleteTable(selectedDb, currentlySelected);
              }
            })
          }
          id="menuButton"
        >
          Remove Table
        </Button>
      )}
      <Grid container className={classes.root} spacing={3}>
        <Grid item xs={12}>
          <Grid container justify="center" spacing={spacing}>
            {tablesContext.length ? (
              tablesContext.map(table => (
                <Grid
                  key={table}
                  item
                  className={
                    currentlySelected === table ? classes.highlightSelected : ''
                  }
                  onClick={() => enableSelected(table)}
                  onDoubleClick={() => getTableContents(table, selectedDb)}
                >
                  <DisplayCard
                    className={classes.control}
                    name={table}
                    type="table"
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

export default withRouter(AllTables);
