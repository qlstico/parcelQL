import React, { useContext, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import { withRouter } from 'react-router-dom';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Refresh from '@material-ui/icons/Refresh';
import BreadcrumbsElem from './Breadcrumbs';
import logoImg from '../../../assets/images/QLSticoV3.png';
import { Button } from '@material-ui/core/';
import { DbRelatedContext, notifyError } from '../index';
const { REFRESH, REFRESH_REPLY } = require('../../constants/ipcNames');
import { electron } from '../../utils/electronImports';
const { ipcRenderer } = electron;

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  inputRoot: {
    color: '#753689',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 200,
    },
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
}));

function PrimarySearchAppBar(props) {
  const classes = useStyles();

  const {
    setAllDbNames,
    setTables,
    setSelectedTableData,
    selectedDb,
    selectedTable,
    currentUser,
    refreshStatus,
    setRefreshStatus,
  } = useContext(DbRelatedContext);

  // Error State
  const [errorMessage] = useState(null);

  const refreshPage = async () => {
    const {
      location: { pathname },
    } = props;

    if (pathname === '/allDBs') {
      await ipcRenderer.send(REFRESH, [pathname, currentUser]);
      await ipcRenderer.once(REFRESH_REPLY, (_, refreshedData) => {
        if (typeof refreshedData === 'string') {
          if (errorMessage !== refreshedData) {
            notifyError(refreshedData);
          }
        } else {
          setAllDbNames(refreshedData);
        }
      });
    } else if (pathname === '/allTables') {
      await ipcRenderer.send(REFRESH, [pathname, selectedDb]);
      await ipcRenderer.once(REFRESH_REPLY, (_, refreshedData) => {
        if (typeof refreshedData === 'string') {
          if (errorMessage !== refreshedData) {
            notifyError(refreshedData);
          }
        } else {
          setTables(refreshedData);
        }
      });
    } else if (pathname === '/indivTable') {
      await ipcRenderer.send(REFRESH, [pathname, [selectedTable, selectedDb]]);
      await ipcRenderer.once(REFRESH_REPLY, (_, refreshedData) => {
        if (typeof refreshedData === 'string') {
          if (errorMessage !== refreshedData) {
            notifyError(refreshedData);
          }
        } else {
          setSelectedTableData(refreshedData);
        }
      });
    }
  };

  const throttle = (func, limit) => {
    return () => {
      if (refreshStatus === false) {
        setRefreshStatus(true);
        func();
        setTimeout(() => setRefreshStatus(false), limit);
      }
    };
  };

  const throttledRefresh = throttle(refreshPage, 2500);

  return (
    <div className={classes.grow}>
      <AppBar position="fixed" id="menuBar" style={{ background: '#753689' }}>
        <Toolbar>
          <Button
            style={{ backgroundColor: 'transparent' }}
            disableTouchRipple
            onClick={() => props.history.push('/')}
          >
            <img id="headerLogo" src={logoImg} />
          </Button>
          <BreadcrumbsElem
            location={props.location.pathname}
            history={props.history}
          />
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            <IconButton
              aria-label="autorenew"
              onClick={() => throttledRefresh()}
            >
              <Refresh style={{ color: '#FFFFFF' }} />
            </IconButton>
            <IconButton
              aria-label="autorenew"
              className={props.location.pathname === '/' ? 'loading' : ''}
              onClick={() => props.history.goBack()}
            >
              <ArrowBack
                style={{ color: '#FFFFFF' }}
                className={props.location.pathname === '/' ? 'loading' : ''}
              />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default withRouter(PrimarySearchAppBar);
