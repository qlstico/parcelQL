import React, { useContext, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import AnnouncementIcon from '@material-ui/icons/Announcement';
import Toolbar from '@material-ui/core/Toolbar';
import { electron } from '../../utils/electronImports';
import {
  DbRelatedContext,
  notifyAdded,
  notifyRemoved,
  notifyError
} from '../index';
const nativeImage = electron.remote.nativeImage;
const { dialog } = electron.remote;
const iconPath = 'app/assets/images/PURPLE_QLSticoV3.png';
const dbIcon = nativeImage.createFromPath(iconPath);
const { ipcRenderer } = electron;
const {
  CREATE_DATABASE,
  CREATE_DATABASE_REPLY,
  DELETE_DATABASE,
  CREATE_TABLE,
  CREATE_TABLE_REPLY,
  DELETE_TABLE,
  DATABASE_ERROR
} = require('../../constants/ipcNames');

const useStyles = makeStyles(theme => ({
  appBar: {
    top: 'auto',
    bottom: 0,
    height: 60
  },
  grow: {
    flexGrow: 1
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex'
    }
  },
  extendedIcon: {
    marginRight: theme.spacing(1)
  }
}));

function Footer(props) {
  const classes = useStyles();

  // Error State
  const [errorMessage, setErrorMessage] = useState(null);

  const {
    setAllDbNames,
    setTables,
    selectedDb,
    selectedTable,
    currentlyHighlightedDb,
    setCurrentlyHighlightedDb
  } = useContext(DbRelatedContext);

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

  const confirmDeleteDb = {
    type: 'question',
    buttons: ['Yes, I do', 'Cancel'],
    defaultId: 1,
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete this database: "${currentlyHighlightedDb}" ?`,
    detail:
      'This is a permanent deletion option, all information contained will be lost.',
    icon: dbIcon
  };

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

  // function for creating table via GUI
  const createNewTable = async () => {
    await ipcRenderer.send(CREATE_TABLE, selectedDb);
    await ipcRenderer.once(CREATE_TABLE_REPLY, (event, newTableName) => {
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

  const add = () => {
    const {
      location: { pathname },
      history
    } = props;
    if (pathname === '/') {
      history.push('/createConnection');
    } else if (pathname === '/allDBs') {
      createDb();
    } else if (pathname === '/allTables') {
      createNewTable();
    }
  };

  const remove = () => {
    const {
      location: { pathname }
    } = props;
    if (pathname === '/allDBs') {
      dialog.showMessageBox(null, confirmDeleteDb, response => {
        if (response === 0) {
          deleteDb(currentlyHighlightedDb);
        }
      });
    } else if (pathname === '/allTables') return null;
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
