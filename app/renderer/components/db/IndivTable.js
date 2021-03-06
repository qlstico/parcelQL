/* eslint-disable no-confusing-arrow */

import React, { useState, useContext, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {
  DbRelatedContext,
  notifyError,
  notifyRemoved,
  notifyAdded,
  RefreshCircle,
  DataTypes
} from '../index';
import TextField from '@material-ui/core/TextField';
import { electron } from '../../utils/electronImports';
const { ipcRenderer } = electron;
const {
  UPDATE_TABLE_DATA,
  REMOVE_TABLE_ROW,
  ADD_TABLE_ROW,
  DATABASE_ERROR
} = require('../../constants/ipcNames');

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%'
  },
  paper: {
    marginTop: theme.spacing(1),
    width: '100%',
    overflowX: 'auto',
    marginBottom: theme.spacing(2)
  },
  table: {
    minWidth: 650
  },
  textField: {
    width: '100%'
  },
  selectedRow: {
    background: 'grey'
  },
  editRow: {
    background: 'yellow'
  },
  changesLogged: {
    background: '#FFE66D'
  }
}));

const IndivTable = () => {
  // For styling components, referencing this directly in
  // components className to access the above styling objects ^^^
  const classes = useStyles();

  // Grabbing the tabledata from the context provider
  const { selectedTableData, selectedDb, selectedTable } = useContext(
    DbRelatedContext
  );

  // Tracking which row is in 'edit mode'
  const [editRow, setEditRow] = useState(false);

  // Setting the matrix created from the context provider's array of objs
  // to render the table cells and to have a 'sandbox copy' in the state
  // to compare changes against the context provider's original version
  const [tableMatrix, setTableMatrix] = useState([]);

  // Stateful field to independently track any changes made to send a smaller
  // load of only pertinent information to the server to make the requested changes
  const [changesMade, setChangesMade] = useState([]);

  // Tracking which row is 'selected'
  const [selectedRow, setSelectedRow] = useState(false);

  // Error State
  const [errorMessage, setErrorMessage] = useState(null);

  // Allows a pseudo loading screen for a predetermined amount of time to allow
  // the app some time to retrieve larger data sets in case it doesn't do so immediately
  // before deciding there is nothing to display
  const [loadTimedOut, setLoadTimedOut] = useState(false);

  const [columnHeaders, setColumnHeaders] = useState([]);

  // Using this as componentDidMount && componentDidUpdate b/c the provider data from
  // context does not make it in time for the initial mounting
  useEffect(() => {
    // If the requested data comes back empty, start a timer to render a loading screen
    // and if the elapsed amount of time is passed, we render a message that this data view
    // is empty
    let startTimeout;
    if (!tableMatrix.length) {
      startTimeout = setTimeout(() => {
        if (!loadTimedOut) {
          setLoadTimedOut(true);
        }
      }, 2500);
    }

    // Creating a 2-d matrix of the selectedTableData from provider in order to
    // represent each object in the selectedTableData array as a row, and each of the
    // values in the 'row obj' as a cell
    const { rows, fields } = selectedTableData;

    if (rows || fields) {
      if (rows.length) {
        const matrix = rows.map(row =>
          // Passing in row id and val as obj to reference inside of
          // handleInputChange and to reference as an attribute inside component
          // Object.values(row).map(value => ({ value, id: row.id }))
          Object.entries(row).map(([key, value]) => ({
            value,
            id: row.id,
            key
          }))
        );
        // Setting the matrix created above as the state for the component instead of
        // just using the context provider directly in order to have a copy we can work with without
        // affecting the true values represented by the provider. This lets us have
        // a sandbox to play with any changes without commiting to them until we hit submit.
        setColumnHeaders(Object.keys(rows[0]));
        setTableMatrix(matrix);
      } else if (fields.length) {
        setColumnHeaders(fields.map(field => field.name));
      }
    }

    if (tableMatrix.length) clearTimeout(startTimeout);

    // We're listening for any changes in selectedDataTable since it takes a little
    // bit for this to come through, therefore we need to update once we actually
    // get ahold of this to properly set our state an kick off rending of the grid table.
  }, [selectedTableData]);

  // Handles input changes for grid cells into the changesMade state field
  const recordCellChangesMade = cell => {
    // checking if we already have a record of requested change in the changesMade
    // state pertaining to this entry by id and key to support multi-field edits
    const inChangeMadeArr = changesMade.some(
      cellData => cellData.id === cell.id && cellData.key === cell.key
    );

    setChangesMade(prevVal => {
      if (inChangeMadeArr) {
        return prevVal.map(cellData => {
          // Checks if this current change already exists by ID and key in order to
          // allow multiple edits of the same entry at the same time and prevent overwritting
          if (cellData.id === cell.id && cellData.key === cell.key) {
            return cell;
          }
          return cellData;
        });
      } else {
        return prevVal.concat(cell);
      }
    });
  };

  // Handling any changes in the grid's cells - takes the event to identify the target cell, the row
  // in the matrix the cell exists in, and the ID of the cell's parent row/obj as it exists in the db
  const handleInputChange = e => {
    // Destructures the 'name' and value of the event target for ease of access to them
    const { name, value } = e.target;
    // Destructures the rowIdx and colIdx from the string returned by the event.target.name
    const [rowIdx, colIdx] = name.split('-');

    const cell = { ...tableMatrix[rowIdx][colIdx] };
    cell.value = value;
    recordCellChangesMade(cell);

    // Makes the changes in state's matrix using the rowIdx and
    //colIdx to locate it's position and rewritting it's value
    setTableMatrix(prevMatrix => {
      // Matrix cells contain objects, therefore we need to find
      //the cell, and reset the value prop within the cell's obj
      prevMatrix[rowIdx][colIdx].value = value;
      return prevMatrix;
    });
  };

  const handleUpdateSubmit = async () => {
    await ipcRenderer.send(UPDATE_TABLE_DATA, [
      selectedTable,
      selectedDb,
      changesMade
    ]);
    // need to use .once instead of .on because .once remove event listener
    // if you use .on, the toast error will first tons of times
    await ipcRenderer.once(DATABASE_ERROR, (_, errorMsg) => {
      if (errorMessage !== errorMsg) {
        notifyError(errorMsg);
      }
    });
  };

  const handleRemoveRow = () => {
    if (selectedRow) {
      ipcRenderer.send(REMOVE_TABLE_ROW, [
        selectedTable,
        selectedDb,
        selectedRow
      ]);
      setTableMatrix(prevMatrix =>
        prevMatrix.filter(row => row[0].id !== selectedRow)
      );
      notifyRemoved(selectedTable, `entry with ID: ${selectedRow}`);
      setSelectedRow(false);
    }
  };

  // Sets the selected row for editing
  const enableEditRow = dbEntryId => {
    setEditRow(dbEntryId);
  };

  // Removes the selected editable row from 'edit mode'
  const removeEditRow = () => {
    setEditRow(false);
  };

  // Sets the 'selected' row
  const enableSelectedRow = dbEntryId => {
    setSelectedRow(dbEntryId);
  };

  // For front-end use to generate a valid id to create and interact
  // with newly user created rows on grid before submitting for creation.
  const generateNewRowTempId = () => {
    // Essentially just grabbing the last entry in the matrix's ID (logically assuming
    // the last entry is sequentially the largest ID value) and adding one to it to
    // ensure new rows are sequentially next in line based on existing data
    if (tableMatrix.length) {
      return tableMatrix[tableMatrix.length - 1][0].id + 1;
    }
    // if table is empty, assign an ID of one as first entry
    return 1;
  };

  // Adding a new row to the GUI grid
  const addRowToState = () => {
    const row = [];
    const rowId = generateNewRowTempId();
    for (let header of columnHeaders) {
      const cell = { id: rowId, header, value: header === 'id' ? rowId : null };
      row.push(cell);
    }
    setTableMatrix(prevMatrix => {
      return prevMatrix.concat([row]);
    });
    setChangesMade(prevChanges => {
      return prevChanges.concat(row);
    });
    notifyAdded(selectedTable, rowId);
  };

  // Get the table header
  // const tableHeader = document.getElementById('table-header');

  // // Add the sticky class to the table header when you reach its scroll position. Remove "sticky" when you leave the scroll position
  // function stickyTableHeader() {
  //   // Get the offset position of the navbar
  //   const sticky = tableHeader.offsetTop;
  //   if (window.pageYOffset >= sticky) {
  //     tableHeader.classList.add('sticky');
  //   } else {
  //     tableHeader.classList.remove('sticky');
  //   }
  // }

  // if (tableHeader) {
  //   // When the user scrolls the page, invoke the stickyheader func
  //   window.onscroll = function() {
  //     stickyTableHeader();
  //   };
  // }
  const [fieldTypeTable, enableFieldTypeTable] = useState(false);

  const handleCheckboxChange = e => {
    const { name, checked } = e.target;
    enableFieldTypeTable(!fieldTypeTable);
  };

  return tableMatrix.length || columnHeaders.length ? (
    <div className={`${classes.root} content`}>
      <FormControlLabel
        style={{ padding: '5px' }}
        control={
          <Checkbox
            name="fieldTypes"
            checked={fieldTypeTable}
            onChange={handleCheckboxChange}
            value={fieldTypeTable}
            color="primary"
          />
        }
        label="View Field Types"
      />
      {fieldTypeTable ? (
        <DataTypes fields={selectedTableData.fields} />
      ) : (
        <>
          <Paper className={classes.paper}>
            <Table className={classes.table} size="small">
              <TableHead>
                <TableRow>
                  {/* Column Headers */}
                  {/* check if there is data, check if array has nested obj, then render */}
                  {columnHeaders.map(header => {
                    return <TableCell key={header}>{header}</TableCell>;
                  })}
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Table Rows Data */}
                {tableMatrix.map((row, rowIdx) => (
                  <TableRow key={rowIdx}>
                    {/* Rows cell data */}
                    {row.map(({ value, id, key }, colIdx) =>
                      // Checks to see if this row is the editable row, if it is render cells as
                      // textField, else render as a normal read only cells.
                      editRow === id ? (
                        <TableCell
                          key={`${rowIdx}-${colIdx}`}
                          component="th"
                          scope="row"
                          className={classes.editRow}
                        >
                          <span
                            style={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              // width: 85, //`${Number.isInteger(value) ? 30 : 130}`
                              display: 'block'
                            }}
                          >
                            <TextField
                              className={classes.textField}
                              type="text"
                              defaultValue={value}
                              // Name field is how we reference this cell's equivalent
                              // position in the state matrix to make changes
                              name={`${rowIdx}-${colIdx}`}
                              onChange={e =>
                                handleInputChange(e, rowIdx, id, key)
                              }
                            />
                          </span>
                        </TableCell>
                      ) : (
                        <TableCell
                          key={`${rowIdx}-${colIdx}`}
                          component="th"
                          scope="row"
                          className={
                            selectedRow === id
                              ? classes.selectedRow
                              : changesMade.some(
                                  changes =>
                                    changes['id'] === id &&
                                    changes['key'] === key
                                )
                              ? classes.changesLogged
                              : null
                          }
                          // Set this row to be the selected row for 'edit mode' in
                          // the state to rerender as a textField.
                          onDoubleClick={() => enableEditRow(id)}
                          // If this is not an 'edit mode' row, clicking on it will
                          // remove 'edit mode'
                          onClick={() => {
                            enableSelectedRow(id);
                            removeEditRow();
                          }}
                          name={`${rowIdx}-${colIdx}`}
                        >
                          {value && value.length > 20 ? (
                            <span
                              style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                width: '150px',
                                display: 'block'
                              }}
                            >{`${value}...`}</span> //styling so that the cells dont display massive amounts of text by default
                          ) : (
                            `${value}`
                          )}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
          <div>
            <Button
              edge="end"
              variant="contained"
              type="button"
              onClick={handleUpdateSubmit}
              color="inherit"
              id="menuButton"
              size="small"
              style={changesMade.length ? { background: '#FFE66D' } : {}}
            >
              Submit
            </Button>
            <Button
              edge="end"
              variant="contained"
              type="button"
              onClick={() => addRowToState()}
              color="inherit"
              id="menuButton"
              size="small"
            >
              Add Row
            </Button>
            {selectedRow && (
              <Button
                variant="contained"
                type="button"
                text="white"
                size="small"
                style={{ background: '#FF715B' }}
                onClick={handleRemoveRow}
                id="menuButton"
              >
                Remove Row
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  ) : loadTimedOut === true ? (
    <h1 id="load-or-empty" className="load-or-refresh">
      Couldn't find anything here!
    </h1>
  ) : (
    <RefreshCircle />
  );
};

export default IndivTable;
