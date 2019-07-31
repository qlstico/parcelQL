const { format } = require('url');
const { encrypt } = require('../server/util');
const { BrowserWindow, app, ipcMain, Menu, MenuItem } = require('electron');
import prompt from 'electron-prompt';
const isDev = require('electron-is-dev');
const { resolve } = require('app-root-path');
const path = require('path');
const url = require('url');
const os = require('os');
const {
  getAllDbs,
  getAllTables,
  getTableData,
  updateTableData,
  createTable,
  removeTableRow,
  deleteTable,
  createDatabase,
  setUserProvidedDbConnection,
  deleteDatabase,
} = require('../db/db');
const express = require('express');
const { postgraphile } = require('postgraphile');
const { express: voyagerMiddleware } = require('graphql-voyager/middleware');
const { closeServer } = require('../server/util');
const {
  GET_DB_NAMES,
  GET_DB_NAMES_REPLY,
  GET_TABLE_NAMES,
  GET_TABLE_NAMES_REPLY,
  GET_TABLE_CONTENTS,
  GET_TABLE_CONTENTS_REPLY,
  CLOSE_SERVER,
  UPDATE_TABLE_DATA,
  CREATE_TABLE,
  CREATE_TABLE_REPLY,
  REMOVE_TABLE_ROW,
  ADD_TABLE_ROW,
  GET_OS_USER,
  GET_OS_USER_REPLY,
  CREATE_DATABASE,
  CREATE_DATABASE_REPLY,
  DELETE_TABLE,
  DELETE_TABLE_REPLY,
  SET_USER_DB_CONNECTION,
  DELETE_DATABASE,
  DELETE_DATABASE_REPLY,
  DATABASE_ERROR,
  REFRESH,
  REFRESH_REPLY,
} = require('../renderer/constants/ipcNames');
const enableDestroy = require('server-destroy');
const iconPath = 'app/assets/images/PURPLE_QLSticoV3.png';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let expressApp;
let expressServer;
let LOGGEDIN_USER_CONFIG = {
  user: '',
  database: '',
  password: '',
  host: 'localhost',
  port: 5432,
  ssl: false,
};

// !!!!!>>>>>>>>>>>>>>>>>>> EXPRESS SERVER  <<<<<<<<<<<<<<<<<<<<<<<<<<<<!!!!!
/* Setup express server when user clicks a db in the front end */
function setupExpress() {
  // destructure necessary fields from user object to establish pg server connection
  const { user, password, host, ssl, database, port } = LOGGEDIN_USER_CONFIG;

  /* Major key is just overwriting existing express app.
  This was the solution */
  expressApp = express();
  // config to connect middleware to database
  const schemaName = 'public';
  const pgConnection = `postgres://${user}:${encrypt(
    password,
    'decrypt'
  )}@${host}:${port}/${database}${ssl === true ? '?ssl=true' : ''}`;
  const pglConfig = {
    watchPg: true,
    graphiql: true,
    enhanceGraphiql: true,
    handleErrors: true,
  };
  // setup middleware for creating our graphql api
  expressApp.use(postgraphile(pgConnection, schemaName, pglConfig));
  // route for visualizer - access via http://localhost:5000/voyager
  expressApp.use('/voyager', voyagerMiddleware({ endpointUrl: '/graphql' }));

  // assign global var our express server so we can close it later
  expressServer = expressApp.listen(5000, function() {
    console.log('Listening :)');
  });

  // enhance with a 'destroy' function
  enableDestroy(expressServer);

  // expressApp.listen(5000);
}

// !!!!!>>>>>>>>>>>>>>>>>>> ELECTRON FUNCTIONS <<<<<<<<<<<<<<<<<<<<<<<<<<<<!!!!!
app.on('ready', async () => {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.once('ready-to-show', () => {
    const ctxMenu = new Menu();
    ctxMenu.append(new MenuItem({ role: 'copy' }));
    ctxMenu.append(new MenuItem({ role: 'paste' }));
    ctxMenu.append(new MenuItem({ role: 'cut' }));
    ctxMenu.append(new MenuItem({ role: 'togglefullscreen' }));
    ctxMenu.append(new MenuItem({ role: 'toggledevtools' }));
    mainWindow.webContents.on('context-menu', function(e, params) {
      ctxMenu.popup(mainWindow, params.x, params.y);
    });
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  const devPath = 'http://localhost:1124';
  const prodPath = format({
    pathname: resolve('app/renderer/.parcel/production/index.html'),
    protocol: 'file:',
    slashes: true,
  });
  const url = isDev ? devPath : prodPath;

  mainWindow.setMenu(null);
  mainWindow.loadURL(url);
});

app.on('window-all-closed', app.quit);

/* !!!!!>>>>>>>>>>>>>>>>>>> ipcMain FUNCTIONS <<<<<<<<<<<<<<<<<<<<<<<<<<<<!!!!!
 * allows us to safely listen for and send communications to front end
 */

//================= C R E A T E  C O N N E C T I O N ========================//
/*
 * called from ./containers/CreateConnection.js in order to prepopulate the
 * user field with the current OS user's name to help standardize an easy local
 * connection
 */
ipcMain.on(GET_OS_USER, event => {
  const { username } = os.userInfo();
  event.reply(GET_OS_USER_REPLY, username);
});

//==================== C O N N E C T I O N S  P A G E ===========================//
/**Responsible for logging in a user.
 * called from ./components/db/ConnectPage.js
 * when the user submits request for login with a specific connection tile
 */
ipcMain.on(SET_USER_DB_CONNECTION, async (_, userConfig) => {
  // Setting to local global config var in order to have access to it for spinning
  // up GraphQL server, especially for non-localhost connections, if/when user finally clicks into
  // a DB table.
  LOGGEDIN_USER_CONFIG = userConfig;
  // Passes in user config to immediately facilitate pg client connection
  await setUserProvidedDbConnection(userConfig);
});

/**
 * called from ./components/db/ConnectPage.js
 * called to get all the db names and replies with the database names
 */
ipcMain.on(GET_DB_NAMES, async event => {
  const dbNames = await getAllDbs();
  // reply with database names from query, or the error message
  event.reply(GET_DB_NAMES_REPLY, dbNames);
});

//======================== A L L  D A T A B A S E S ===========================//
/**
 * called from ./components/db/AllDBs.js
 * when user clicks database, sends message to trigger creating a db
 * and replies with updated array of all db names after dletion
 */
ipcMain.on(CREATE_DATABASE, async event => {
  const input = await prompt({
    title: 'Create New Database',
    label: 'New Database Name:',
    icon: iconPath,
  });
  if (input === null)
    event.reply(CREATE_DATABASE_REPLY, 'Canceled database creation.');
  else {
    const existingDatabases = await createDatabase(input);
    event.reply(CREATE_DATABASE_REPLY, existingDatabases);
  }
  // reply with database names from query
});

/**
 * called from ./components/db/AllDBs.js
 * when user clicks database, sends message to trigger delete a db
 * and replies with updated array of all db names after dletion
 */
ipcMain.on(DELETE_DATABASE, async (event, databaseName) => {
  const response = await deleteDatabase(databaseName);
  event.reply(DATABASE_ERROR, response);
});

/**
 * called from ./components/db/AllDBs.js
 * when user clicks database, sends message to trigger getting the table data
 * call to get all the table names and replies with the tableNames
 */
ipcMain.on(GET_TABLE_NAMES, async (event, dbname) => {
  // KICKS ON EXPRESS SERVER TO SERVICE GRAPHQL REQUESTS
  LOGGEDIN_USER_CONFIG.database = dbname;
  setupExpress();
  const tableNames = await getAllTables(dbname);
  event.reply(GET_TABLE_NAMES_REPLY, tableNames);
});

//======================== A L L  T A B L E S ===============================//
/**
 * called from ./components/db/AllTables.js
 * when user clicks specific table, we recieve call
 * get all the table data and replies with the table data
 */
ipcMain.on(GET_TABLE_CONTENTS, async (event, args) => {
  // args === (table, selectedDb)
  const tableData = await getTableData(...args);
  event.reply(GET_TABLE_CONTENTS_REPLY, tableData);
});

/**
 * called from ./components/db/allTables.js
 * when the user submits request for a new table
 */
// args === [selectedDb, newTableName]
ipcMain.on(CREATE_TABLE, async (event, db) => {
  const input = await prompt({
    title: 'Create New Table',
    label: 'New Table Name:',
    icon: iconPath,
  });

  if (input === null)
    event.reply(CREATE_TABLE_REPLY, 'Canceled table creation.');
  else {
    const newTableAddition = await createTable(db, input);
    event.reply(CREATE_TABLE_REPLY, newTableAddition);
  }
});

/**
 * called from ./components/db/allTables.js
 * when the user submits request for deleting table
 */
// args === [selectedDb, selectedTableName]
ipcMain.on(DELETE_TABLE, async (event, args) => {
  const response = await deleteTable(...args);
  event.reply(DATABASE_ERROR, response);
});

//======================== I N D I V  T A B L E ===============================//
/**
 * called from ./components/db/IndivTable.js
 * when the user submits the changes to the table
 */
// args === [selectedTable,selectedDb,tableMatrix]
ipcMain.on(UPDATE_TABLE_DATA, async (event, args) => {
  const response = await updateTableData(...args);
  typeof response === 'string' && event.reply(DATABASE_ERROR, response);
});

/**
 * called from ./components/db/IndivTable.js
 * when the user submits request for deleting a row in the grid
 */
// args === [selectedTable, selectedDb, selectedRowId]
ipcMain.on(REMOVE_TABLE_ROW, async (_, args) => {
  await removeTableRow(...args);
});

//======================== U T I L S =================================//
/**
 * called when user lands on either ./components/db/AllDBs.js or
 * ./components/db/ConnectPage.js ...
 * Logic in components checks to see if the express server is running (typically
 * meaning it's already serving up some specific DB's schema), and kills it so that
 * the server isn't stuck servicing a DB we are no longer inside of.
 */
ipcMain.on(CLOSE_SERVER, async (event, args) => {
  closeServer(expressServer, 'closeserver*****');
});

/**Called from ./components/reuse/Header.js on refresh button
 * args === [currentComponent (component that is requesting a refresh), any other args
 * necessary to make the backend requests for that component to successfully refresh]
 */
ipcMain.on(REFRESH, async (event, args) => {
  const currentComponent = args[0];
  const refreshArgs = args[1];
  if (currentComponent === 'alldbs') {
    const dbNames = await getAllDbs();
    event.reply(REFRESH_REPLY, dbNames);
  } else if (currentComponent === 'alltables') {
    const tableNames = await getAllTables(refreshArgs);
    event.reply(REFRESH_REPLY, tableNames);
  } else if (currentComponent === 'indivtable') {
    const tableData = await getTableData(...refreshArgs);
    event.reply(REFRESH_REPLY, tableData);
  } else {
    return;
  }
});
