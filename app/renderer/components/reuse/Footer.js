import React, { useContext } from 'react';
import { withRouter } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import SaveIcon from '@material-ui/icons/Save';
import DeleteIcon from '@material-ui/icons/Delete';
import Toolbar from '@material-ui/core/Toolbar';
import { electron } from '../../utils/electronImports';
const { ipcRenderer } = electron;

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

  const add = () => {
    const {
      location: { pathname },
      history
    } = props;
    if (pathname === '/') {
      history.push('/createConnection');
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
          {props.location.pathname === 'indivTable' && (
            <IconButton color="primary" aria-label="add">
              <SaveIcon style={{ color: '#FFE66D' }} />
            </IconButton>
          )}
          <IconButton color="primary" aria-label="add" onClick={() => add()}>
            <AddIcon style={{ color: 'green' }} />
          </IconButton>
          <IconButton color="primary" aria-label="remove">
            <DeleteIcon style={{ color: 'red' }} />
          </IconButton>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default withRouter(Footer);
