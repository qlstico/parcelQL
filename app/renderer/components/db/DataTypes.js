import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const { pgDataTypes } = require('../../../server/util');

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%'
  },
  table: {
    minWidth: 650
  },
  paper: {
    marginTop: theme.spacing(3),
    width: '100%',
    overflowX: 'auto',
    marginBottom: theme.spacing(2)
  }
}));

const DataTypes = ({ fields }) => {
  const classes = useStyles();
  return (
    <Paper className={classes.paper}>
      <Table className={classes.table} size="small">
        <TableHead>
          <TableRow>
            <TableCell key="fieldName">Field Name</TableCell>
            <TableCell key="fieldType">Field Type</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fields.map((field, idx) => (
            <TableRow key={`field${idx}`}>
              <TableCell key={`fieldName${idx}`} component="th" scope="row">
                {field.name}
              </TableCell>
              <TableCell key={`fieldType${idx}`} component="th" scope="row">
                {pgDataTypes[field.dataTypeID]}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default DataTypes;
