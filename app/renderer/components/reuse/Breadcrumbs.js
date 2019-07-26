import React, { useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';
import { DbRelatedContext } from '../index';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles(theme => ({
  root: {
    justifyContent: 'center',
    marginRight: theme.spacing(2),
    marginLeft: 0,
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto'
    }
  },
  paper: {
    padding: theme.spacing(1, 2)
  }
}));

const BreadcrumbsElem = props => {
  const classes = useStyles();
  const { selectedDb, currentTable } = useContext(DbRelatedContext);

  return (
    <div className={classes.root}>
      <Breadcrumbs separator="/" aria-label="Breadcrumb">
        <Button>
          <Link id="breadcrumbs" onClick={() => props.history.push('/')}>
            Connect
          </Link>
        </Button>
        {props.location === '/editConnection' ? (
          <Button>
            <Link
              id="breadcrumbs"
              onClick={() => props.history.push('/editConnection')}
            >
              Edit Connection
            </Link>
          </Button>
        ) : (
          ''
        )}
        {props.location === '/createConnection' ? (
          <Button>
            <Link
              id="breadcrumbs"
              onClick={() => props.history.push('/createConnection')}
            >
              Create Connection
            </Link>
          </Button>
        ) : (
          ''
        )}
        {props.location !== '/' &&
        props.location !== '/editConnection' &&
        props.location !== '/createConnection' ? (
          <Button>
            <Link
              id="breadcrumbs"
              onClick={() => props.history.push('/allDBs')}
            >
              Databases
            </Link>
          </Button>
        ) : (
          ''
        )}
        {props.location === '/allTables' ? (
          <Button>
            <Link
              id="breadcrumbs"
              onClick={() => props.history.push('/allTables')}
            >
              {selectedDb}
            </Link>
          </Button>
        ) : (
          ''
        )}
        {props.location === '/indivTable' ? (
          <div>
            <Button>
              <Link
                id="breadcrumbs"
                onClick={() => props.history.push('/allTables')}
              >
                {selectedDb}
              </Link>
            </Button>
            {'  /  '}
            <Button>
              <Link
                id="breadcrumbs"
                onClick={() => props.history.push('/indivTable')}
              >
                {currentTable}
              </Link>
            </Button>
          </div>
        ) : (
          ''
        )}
      </Breadcrumbs>
    </div>
  );
};

export default BreadcrumbsElem;
