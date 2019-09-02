import React, { useContext, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import Toolbar from '@material-ui/core/Toolbar';
import { electron } from '../../utils/electronImports';
import {
  DbRelatedContext,
  notifyAdded,
  notifyRemoved,
  notifyError,
} from '../index';
const nativeImage = electron.remote.nativeImage;
const { dialog } = electron.remote;
const dbIconPath = 'app/assets/images/PURPLE_QLSticoV3.png';
const tableIconPath = 'app/assets/images/PURPLE_QLSticoV3.png';
const tableIcon = nativeImage.createFromPath(tableIconPath);
const dbIcon = nativeImage.createFromPath(dbIconPath);
const { ipcRenderer } = electron;
const {
  CREATE_DATABASE,
  CREATE_DATABASE_REPLY,
  DELETE_DATABASE,
  CREATE_TABLE,
  CREATE_TABLE_REPLY,
  DELETE_TABLE,
  DATABASE_ERROR,
} = require('../../constants/ipcNames');

const useStyles = makeStyles(theme => ({
  appBar: {
    top: 'auto',
    bottom: 0,
    height: 60,
  },
  grow: {
    flexGrow: 1,
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
}));

function Footer(props) {
  const classes = useStyles();

  // Error State
  const [errorMessage] = useState(null);

  const {
    setAllDbNames,
    setTables,
    selectedDb,
    currentlyHighlightedDb,
    setCurrentlyHighlightedDb,
    currentlyHighlightedTable,
    setCurrentlyHighlightedTable,
  } = useContext(DbRelatedContext);

  // function for creating a new db using the footer buttons
  const createDb = async () => {
    await ipcRenderer.send(CREATE_DATABASE);
    await ipcRenderer.once(CREATE_DATABASE_REPLY, (event, newDbName) => {
      if (typeof newDbName === 'string') {
        if (errorMessage !== newDbName) {
          notifyError(newDbName);
        }
      } else {
        setAllDbNames(prevDbs => prevDbs.concat(newDbName));
        notifyAdded('your PG databses', ...newDbName);
      }
    });
  };

  // properties for the prompt that appears to confirm deleting a db
  const confirmDeleteDb = {
    type: 'question',
    buttons: ['Yes, I do', 'Cancel'],
    defaultId: 1,
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete this database: "${currentlyHighlightedDb}" ?`,
    detail:
      'This is a permanent deletion option, all information contained will be lost.',
    icon: dbIcon,
  };

  // function for deleting db through footer buttons
  const deleteDb = async () => {
    if (currentlyHighlightedDb) {
      await ipcRenderer.send(DELETE_DATABASE, currentlyHighlightedDb);
      await ipcRenderer.once(DATABASE_ERROR, (_, errorMsg) => {
        if (typeof errorMsg === 'string' && errorMessage !== errorMsg) {
          notifyError(errorMsg);
          return null;
        }
        setAllDbNames(prevDbs =>
          prevDbs.filter(db => db !== currentlyHighlightedDb)
        );
        notifyRemoved('your PG databases', currentlyHighlightedDb);
        setCurrentlyHighlightedDb(null);
      });
    }
  };

  // function for creating table via footer buttons
  const createNewTable = async () => {
    await ipcRenderer.send(CREATE_TABLE, selectedDb);
    await ipcRenderer.once(CREATE_TABLE_REPLY, (_, newTableName) => {
      if (typeof newTableName === 'string') {
        if (errorMessage !== newTableName) {
          notifyError(newTableName);
        }
      } else {
        setTables(prevTables => prevTables.concat(newTableName));
        notifyAdded(selectedDb, ...newTableName);
      }
    });
  };

  // Options for the confirmation box for deleting a table
  const confirmDeleteTable = {
    type: 'question',
    buttons: ['Yes, I do', 'Cancel'],
    defaultId: 1,
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete this table: "${currentlyHighlightedTable}" ?`,
    detail:
      'This is a permanent deletion option, all information contained will be lost.',
    icon: tableIcon,
  };

  // function for deleting the highlighted table from the footer button
  const deleteTable = async () => {
    if (currentlyHighlightedTable) {
      await ipcRenderer.send(DELETE_TABLE, [
        selectedDb,
        currentlyHighlightedTable,
      ]);
      await ipcRenderer.once(DATABASE_ERROR, (_, errorMsg) => {
        if (typeof errorMsg === 'string' && errorMessage !== errorMsg) {
          notifyError(errorMsg);
          return null;
        }
        setTables(prevTables =>
          prevTables.filter(table => table !== currentlyHighlightedTable)
        );
        notifyRemoved(selectedDb, currentlyHighlightedTable);
        setCurrentlyHighlightedTable(null);
      });
    }
  };

  // function that 'routes' the correct function to the add button based on what
  // component we are currently on
  const add = () => {
    const {
      location: { pathname },
      history,
    } = props;
    if (pathname === '/') {
      history.push('/createConnection');
    } else if (pathname === '/allDBs') {
      createDb();
    } else if (pathname === '/allTables') {
      createNewTable();
    }
  };

  // function that 'routes' the current function to the remove button based on what
  // component we are currently on.
  const remove = () => {
    const {
      location: { pathname },
    } = props;
    if (pathname === '/allDBs') {
      dialog.showMessageBox(null, confirmDeleteDb, response => {
        if (response === 0) {
          deleteDb(currentlyHighlightedDb);
        }
      });
    } else if (pathname === '/allTables') {
      dialog.showMessageBox(null, confirmDeleteTable, response => {
        if (response === 0) {
          deleteTable(currentlyHighlightedTable);
        }
      });
    }
  };

  return (
    <AppBar
      position="fixed"
      className={classes.appBar}
      style={{ background: '#753689' }}
    >
      <Toolbar>
        <div className={classes.grow} />
        <div className={classes.sectionDesktop}>
          {/* {props.location.pathname === 'indivTable' && (
            <IconButton color="primary" aria-label="add">
              <SaveIcon style={{ color: '#FFE66D' }} />
            </IconButton>
          )} */}
          <IconButton color="secondary" aria-label="add" onClick={() => add()}>
            <AddIcon style={{ color: 'white' }} />
          </IconButton>
          <IconButton
            color="primary"
            aria-label="remove"
            onClick={() => remove()}
            className={
              currentlyHighlightedDb !== null ||
              currentlyHighlightedTable !== null
                ? ''
                : 'loading'
            }
          >
            <DeleteIcon style={{ color: 'white' }} />
          </IconButton>
          {/* <IconButton
            color="primary"
            aria-label="announcement"
            onClick={() =>
              window.open('https://qlstico.io', '_blank', 'nodeIntegration=no')
            }
          >
            <AnnouncementIcon style={{ color: 'white' }} />
          </IconButton> */}
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default withRouter(Footer);
