const { format } = require('url');

const { BrowserWindow, app } = require('electron');
const isDev = require('electron-is-dev');
const { resolve } = require('app-root-path');
// const {
//   getAllDbs,
//   getAllTables,
//   getTableData,
//   updateTableData,
//   createTable,
//   removeTableRow,
//   deleteTable,
//   createDatabase,
//   setUserProvidedDbConnection,
//   deleteDatabase,
// } = require('./src/db/db');
const express = require('express');
const { postgraphile } = require('postgraphile');
const { express: voyagerMiddleware } = require('graphql-voyager/middleware');
// const { closeServer } = require('./src/server/util');
const {
  LOGIN_FORM_DATA,
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
} = require('../renderer/constants/ipcNames');
const enableDestroy = require('server-destroy');

app.on('ready', async () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
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
