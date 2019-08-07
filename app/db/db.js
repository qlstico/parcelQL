const { encrypt } = require('../server/util');
const pg = require('pg');

const DB_CONNECTION = {
  user: '',
  database: '',
  password: '',
  host: 'localhost', // Server hosting the postgres database
  port: 5432,
  idleTimeoutMillis: 300, // how long a client is allowed to remain idle before being closed
  ssl: false
};

// Helper Functions
const setDatabase = dbName => {
  DB_CONNECTION.database = dbName;
};

const setUserProvidedDbConnection = userConnection => {
  const { user, password, host, ssl, databaseName, port } = userConnection;
  DB_CONNECTION.user = user;
  DB_CONNECTION.password = encrypt(password, 'decrypt');
  DB_CONNECTION.host = host;
  DB_CONNECTION.ssl = ssl;
  DB_CONNECTION.database = databaseName;
  DB_CONNECTION.port = port;
};

const getAllDbs = async () => {
  const { database } = DB_CONNECTION;
  const pool = new pg.Pool(DB_CONNECTION);
  try {
    // If user config specified a specifc DB to connect to, we don't need to worry
    // about filtering/finding and error checking from the pg response as the
    // pg connection will automatically throw an error if anything is wrong with the config,
    // such as an invalid db name. This query still needs to run though in order for an error
    // to be thrown or else app crashes for SSL connections.
    const response = await pool.query(
      'SELECT datname FROM pg_database WHERE datistemplate = false'
    );
    // If user config specifies a db to connect to, simply return the db name as an
    // array. If this code even runs, then that means the db connection didn't error out and
    // the db name provided is valid.
    if (database !== '') return [database];
    const arrayOfDbNames = response.rows.map(({ datname }) => {
      return datname;
    });
    return arrayOfDbNames;
  } catch (error) {
    console.error(error);
    return error.message;
  }
};

// Error handling thanks to pool.query throwing errors on bad connections relieves the stress
// of having to reaload any queries after CRUD operations - if they succeed we just have the front end
// proceed to add the values to the GUI itself.. But we let the front end if anything fails here so it
// doesn't reflect inaccurate information.
const createDatabase = async databaseName => {
  const pool = new pg.Pool(DB_CONNECTION);
  try {
    await pool.query(`CREATE DATABASE "${databaseName}"`);
    return [databaseName];
  } catch (error) {
    console.error(error);
    return error.message;
  }
};

const deleteDatabase = async databaseName => {
  setDatabase('');
  const pool = new pg.Pool(DB_CONNECTION);
  try {
    await pool.query(`DROP DATABASE "${databaseName}"`);
    return null;
  } catch (error) {
    console.error(error);
    return error.message;
  }
};

const getAllTables = async database => {
  setDatabase(database);
  const pool = new pg.Pool(DB_CONNECTION);
  try {
    const response = await pool.query(
      `SELECT table_name FROM  information_schema.tables
      WHERE table_type = 'BASE TABLE'
      AND table_schema NOT IN ('pg_catalog', 'information_schema', 'management','postgraphile_watch') and table_name != '_Migration'`
    );
    return response.rows.map(({ table_name: tableName }) => tableName);
  } catch (error) {
    console.error(error);
    return error.message;
  }
};

const createTable = async (selectedDb, newTableName) => {
  setDatabase(selectedDb);
  const pool = new pg.Pool(DB_CONNECTION);
  try {
    await pool.query(
      `CREATE TABLE "${newTableName}" (
      "id" SERIAL PRIMARY KEY
      );`
    );
    return [newTableName];
  } catch (error) {
    console.error(error);
    return error.message;
  }
};

const deleteTable = async (selectedDb, selectedTableName) => {
  setDatabase(selectedDb);
  const pool = new pg.Pool(DB_CONNECTION);
  try {
    await pool.query(`DROP TABLE "${selectedTableName}"`);
    return null;
  } catch (error) {
    console.error(error);
    return error.message;
  }
};

const getTableData = async (table, database) => {
  setDatabase(database);
  const pool = new pg.Pool(DB_CONNECTION);
  try {
    const response = await pool.query(`SELECT * from "${table}"`);
    console.log(response.fields);
    return response;
  } catch (error) {
    console.error(error);
    return error.message;
  }
};

const removeTableRow = async (table, database, id) => {
  setDatabase(database);
  const pool = new pg.Pool(DB_CONNECTION);
  try {
    const response = await pool.query(`DELETE FROM "${table}" where id=${id}`);
    return response.rows;
  } catch (error) {
    console.error(error);
    return error.message;
  }
};

const tranformCellToSql = ({ key, value, id }) => {
  return [`"${key}" = $${1}`, [value, id]];
};

const updateTableData = async (table, database, allUpdatedCells) => {
  setDatabase(database);
  const pool = new pg.Pool(DB_CONNECTION);
  const keysAndParamsNestedArr = allUpdatedCells.reduce((accum, cell) => {
    // get key from cell and create object with key of id and value of field(ie key)=value
    return accum.concat([tranformCellToSql(cell)]);
  }, []);
  const queryArr = keysAndParamsNestedArr.map(([updateStr, values]) => [
    `UPDATE "${table}" SET ${updateStr} WHERE id=$${values.length} returning *`,
    values
  ]);
  try {
    for (const [queryStr, params] of queryArr) {
      await pool.query(queryStr, params);
    }
  } catch (error) {
    console.error(error);
    return error.message;
  }
};

module.exports = {
  getAllTables,
  getAllDbs,
  getTableData,
  updateTableData,
  createTable,
  deleteTable,
  removeTableRow,
  createDatabase,
  setUserProvidedDbConnection,
  deleteDatabase
};
