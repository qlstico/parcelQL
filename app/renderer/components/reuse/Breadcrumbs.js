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
      width: 'auto',
    },
  },
  paper: {
    padding: theme.spacing(1, 2),
  },
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
        {props.location !== '/' ? (
          <Button>
            <Link id="breadcrumbs" onClick={() => props.history.push('/dbs')}>
              Databases
            </Link>
          </Button>
        ) : (
          ''
        )}
        {props.location === '/tables' ? (
          <Button>
            <Link
              id="breadcrumbs"
              onClick={() => props.history.push('/tables')}
            >
              {selectedDb}
            </Link>
          </Button>
        ) : (
          ''
        )}
        {props.location === '/single' ? (
          <div>
            <Button>
              <Link
                id="breadcrumbs"
                onClick={() => props.history.push('/tables')}
              >
                {selectedDb}
              </Link>
            </Button>
            {'  /  '}
            <Button size="small">
              <Link
                id="breadcrumbs"
                onClick={() => props.history.push('/single')}
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
