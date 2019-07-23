import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = makeStyles(theme => ({
  progress: {
    margin: theme.spacing(2)
  }
}));

export default function RefreshCircle() {
  const classes = useStyles();

  return (
    <div className="load-or-refresh">
      <CircularProgress className={classes.progress} color="secondary" />
    </div>
  );
}
