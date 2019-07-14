import React, { useContext } from 'react';
import { fade, makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import { withRouter } from 'react-router-dom';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Refresh from '@material-ui/icons/Refresh';
import BreadcrumbsElem from './Breadcrumbs';
import logoImg from '../../../assets/images/whiteLogo.png';
import { Button } from '@material-ui/core/';
import { DbRelatedContext } from '../index';
const { REFRESH, REFRESH_REPLY } = require('../../constants/ipcNames');
import { electron } from '../../utils/electronImports';
const { ipcRenderer } = electron;
const { throttle } = require('../../../server/util');

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block'
    }
  },
  inputRoot: {
    color: '#753689'
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 200
    }
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex'
    }
  }
}));

function PrimarySearchAppBar(props) {
  const classes = useStyles();

  const {
    currentComponent,
    setAllDbNames,
    setTables,
    setSelectedTableData,
    selectedDb,
    selectedTable,
    currentUser,
    refreshStatus,
    setRefreshStatus
  } = useContext(DbRelatedContext);

  const refreshPage = async () => {
    setRefreshStatus(true);
    console.log(`I'm throttled!`);
    if (currentComponent === 'alldbs') {
      await ipcRenderer.send(REFRESH, [currentComponent, currentUser]);
      await ipcRenderer.on(REFRESH_REPLY, (event, refreshedData) => {
        setAllDbNames(refreshedData);
        setRefreshStatus(false);
      });
    } else if (currentComponent === 'alltables') {
      await ipcRenderer.send(REFRESH, [currentComponent, selectedDb]);
      await ipcRenderer.on(REFRESH_REPLY, (event, refreshedData) => {
        setTables(refreshedData);
      });
    } else if (currentComponent === 'indivtable') {
      await ipcRenderer.send(REFRESH, [
        currentComponent,
        [selectedTable, selectedDb]
      ]);
      await ipcRenderer.on(REFRESH_REPLY, (event, refreshedData) => {
        setSelectedTableData(refreshedData);
      });
    } else {
      console.log('Nothing to refresh!');
    }
  };

  const throttledRefresh = throttle(3000, refreshPage);

  return (
    <div className={classes.grow}>
      <AppBar position="static" id="menuBar" style={{ background: '#753689' }}>
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
            <IconButton aria-label="autorenew" onClick={throttledRefresh}>
              <Refresh style={{ color: '#FFFFFF' }} />
            </IconButton>
            <IconButton
              aria-label="autorenew"
              onClick={() => props.history.goBack()}
            >
              <ArrowBack style={{ color: '#FFFFFF' }} />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default withRouter(PrimarySearchAppBar);
