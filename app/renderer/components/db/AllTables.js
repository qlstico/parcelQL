import React, { useState, useContext, useEffect } from 'react';
import {
  DisplayCard,
  DbRelatedContext,
  GraphQLDisplayCard,
  VoyagerDisplayCard,
  notifyError,
  RefreshCircle
} from '../index';
import Grid from '@material-ui/core/Grid';
import { withRouter } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { electron } from '../../utils/electronImports';
const { ipcRenderer } = electron;

// For all ipcRenderer funcs
const {
  GET_TABLE_CONTENTS,
  GET_TABLE_CONTENTS_REPLY,
  DATABASE_ERROR
} = require('../../constants/ipcNames');

// For styling MaterialUI components
const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1
  },
  control: {
    padding: theme.spacing(2)
  },
  // This is how selected rows get their grey color set by assinging this as classname
  highlightSelected: {
    background: 'grey'
  }
}));

const AllTables = props => {
  // FOr styling:
  const classes = useStyles();
  const [spacing] = useState(0);

  // Error State
  const [errorMessage, setErrorMessage] = useState(null);

  // Getting relevant information from context provider component
  const {
    tables: tablesContext,
    selectedDb,
    setSelectedTableData,
    setServerStatus,
    setSelectedTable,
    setCurrentTable,
    currentlyHighlightedTable,
    setCurrentlyHighlightedTable
  } = useContext(DbRelatedContext);

  // Retrieves the tables data from the double clicked table icon
  const getTableContents = async table => {
    // Clears table data in case it takes a minute to retrieve new data and previously
    // selected table data is still in the provider, causing old data to render temporariliy
    setSelectedTableData([]);
    // For provider to know what table to execute backend functions on
    setSelectedTable(table);
    // For breadcrumbs to access current table name
    setCurrentTable(table);
    await ipcRenderer.send(GET_TABLE_CONTENTS, [table, selectedDb]);
    await ipcRenderer.once(GET_TABLE_CONTENTS_REPLY, (event, tableData) => {
      if (typeof tableData === 'string') {
        if (errorMessage !== tableData) {
          notifyError(tableData);
        }
      } else {
        setSelectedTableData(tableData);
        setCurrentlyHighlightedTable(null);
        props.history.push('/indivTable');
      }
    });
  };

  // Allows a pseudo loading screen for a predetermined amount of time to allow
  // the app some time to retrieve larger data sets in case it doesn't do so immediately
  // before deciding there is nothing to display
  const [loadTimedOut, setLoadTimedOut] = useState(false);

  // Send provider a true value to kick on server
  useEffect(() => {
    // If the requested data comes back empty, start a timer to render a loading screen
    // and if the elapsed amount of time is passed, we render a message that this data view
    // is empty
    let startTimeout;
    if (!tablesContext.length) {
      startTimeout = setTimeout(() => {
        if (!loadTimedOut) {
          setLoadTimedOut(true);
        }
      }, 2500);
    }

    setServerStatus(true);
    //listens for rerender when anything in the tables context provider changes,
    // i.e. a table is added or removed

    // If and when the data requeted does finally come through, we remove the countdown
    // for the loading screen
    if (tablesContext.length) clearTimeout(startTimeout);
  }, [tablesContext]);

  return (
    <div className="content">
      <h1 style={{ padding: '5px' }}>GraphQL Tools: </h1>
      <GraphQLDisplayCard />
      <VoyagerDisplayCard />
      <h1 style={{ padding: '5px' }}>Tables: </h1>
      <Grid container className={classes.root} justify="start">
        <Grid item xs={15}>
          <Grid container justify="start" spacing={spacing}>
            {tablesContext.length ? (
              tablesContext.map(table => (
                <Grid
                  key={table}
                  item
                  className={
                    currentlyHighlightedTable === table
                      ? classes.highlightSelected
                      : ''
                  }
                  onClick={() => setCurrentlyHighlightedTable(table)}
                  onDoubleClick={() => getTableContents(table, selectedDb)}
                >
                  <DisplayCard
                    className={classes.control}
                    name={table}
                    type="table"
                  />
                </Grid>
              ))
            ) : loadTimedOut === true ? (
              <h1 id="load-or-empty">Couldn't find anything here!</h1>
            ) : (
              <RefreshCircle />
            )}
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default withRouter(AllTables);
