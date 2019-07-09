const { encrypt } = require('../server/util');
const pg = require('pg');

const DB_CONNECTION = {
  user: '', // env var: PGUSER
  database: '', // env var: PGDATABASE
  password: '', // env var: PGPASSWORD
  host: 'localhost', // Server hosting the postgres database
  port: 5432, // env var: PGPORT
  idleTimeoutMillis: 300, // how long a client is allowed to remain idle before being closed
};

// Helper Functions
const setDatabase = dbName => {
  DB_CONNECTION.database = dbName;
};

const setUserProvidedDbConnection = userConnection => {
  const { user, password, host } = userConnection;
  DB_CONNECTION.user = user;
  DB_CONNECTION.password = encrypt(password, 'decrypt');
  DB_CONNECTION.host = host;
};

const tranformRowToSql = (id, row) => {
  const valuesArr = [];
  return [
    row
      .filter(
        ({ key }) => key !== 'createdAt' && key !== 'updatedAt' //&& !/\w+id$/i.test(key)
      )
      .map(({ key, value }, idx) => {
        // removes these two keys from the sql
        // makes sure we are not converting ints to strings
        valuesArr.push(value);
        // postgresSQL is case sensitive so if we use camel case must wrap key in ""
        return `"${key}" = $${idx + 1}`;
      })
      .join(', '),
    valuesArr.concat(id),
  ];
};

const getAllDbs = async () => {
  const pool = new pg.Pool(DB_CONNECTION);
  try {
    const response = await pool.query(
      'SELECT datname FROM pg_database WHERE datistemplate = false'
    );
    const arrayOfDbNames = response.rows.map(({ datname }) => {
      return datname;
    });
    return arrayOfDbNames;
  } catch (error) {
    console.log(error);
  }
};

const createDatabase = async databaseName => {
  const pool = new pg.Pool(DB_CONNECTION);
  try {
    await pool.query(`CREATE DATABASE "${databaseName}"`);
    const response = await pool.query(
      'SELECT datname FROM pg_database WHERE datistemplate = false'
    );
    const arrayOfDbNames = response.rows.map(({ datname }) => {
      return datname;
    });
    return arrayOfDbNames;
  } catch (error) {
    console.log(error);
  }
};

const deleteDatabase = async databaseName => {
  const pool = new pg.Pool(DB_CONNECTION);
  try {
    await pool.query(`DROP DATABASE "${databaseName}"`);
    const response = await pool.query(
      'SELECT datname FROM pg_database WHERE datistemplate = false'
    );
    const arrayOfDbNames = response.rows.map(({ datname }) => {
      return datname;
    });
    return arrayOfDbNames;
  } catch (error) {
    console.log(error);
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
    // console.log(response);
    return response.rows.map(({ table_name }) => table_name);
  } catch (error) {
    console.log(error);
  }
};

const createTable = async (selectedDb, newTableName) => {
  setDatabase(selectedDb);
  const pool = new pg.Pool(DB_CONNECTION);
  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS "${newTableName}" (
      "id" SERIAL PRIMARY KEY
      );`
    );

    const response = await pool.query(
      `SELECT table_name FROM  information_schema.tables
      WHERE table_type = 'BASE TABLE'
      AND table_schema NOT IN ('pg_catalog', 'information_schema', 'management','postgraphile_watch') and table_name != '_Migration'`
    );
    return response.rows.map(({ table_name }) => table_name);
  } catch (error) {
    console.log(error);
  }
};

const deleteTable = async (selectedDb, selectedTableName) => {
  setDatabase(selectedDb);
  const pool = new pg.Pool(DB_CONNECTION);
  try {
    await pool.query(`DROP TABLE "${selectedTableName}"`);

    const response = await pool.query(
      `SELECT table_name FROM  information_schema.tables
      WHERE table_type = 'BASE TABLE'
      AND table_schema NOT IN ('pg_catalog', 'information_schema', 'management','postgraphile_watch') and table_name != '_Migration'`
    );
    return response.rows.map(({ table_name }) => table_name);
  } catch (error) {
    console.log(error);
  }
};

const getTableData = async (table, database) => {
  setDatabase(database);
  const pool = new pg.Pool(DB_CONNECTION);
  try {
    const response = await pool.query(`SELECT * from "${table}"`);
    return response.rows;
  } catch (error) {
    console.log(error);
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
  }
};

const tranformCellToSql = ({ key, value, id }) => {
  return [`"${key}" = $${1}`, [value, id]];
};

const updateTableData = async (table, database, allUpdatedCells) => {
  console.log(allUpdatedCells);
  setDatabase(database);
  const pool = new pg.Pool(DB_CONNECTION);
  const keysAndParamsNestedArr = allUpdatedCells.reduce((accum, cell) => {
    // get key from cell and create object with key of id and value of field(ie key)=value
    return accum.concat([tranformCellToSql(cell)]);
  }, []);
  const queryArr = keysAndParamsNestedArr.map(([updateStr, values]) => [
    `UPDATE "${table}" SET ${updateStr} WHERE id=$${values.length} returning *`,
    values,
  ]);
  try {
    for (const [queryStr, params] of queryArr) {
      await pool.query(queryStr, params);
    }
  } catch (error) {
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
  deleteDatabase,
};
