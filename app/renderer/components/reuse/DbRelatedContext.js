import React, { useState, createContext } from 'react';

export const DbRelatedContext = createContext();

export const DbRelatedProvider = ({ children }) => {
  const [allDbNames, setAllDbNames] = useState(null);
  const [currentTable, setCurrentTable] = useState('users');
  const [tables, setTables] = useState(['todos']);
  const [selectedDb, setSelectedDb] = useState('todos');
  const [selectedTableData, setSelectedTableData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [serverStatus, setServerStatus] = useState(false);
  const [selectedTable, setSelectedTable] = useState('todos');
  return (
    <DbRelatedContext.Provider
      value={{
        tables,
        setTables,
        selectedDb,
        setSelectedDb,
        selectedTableData,
        setSelectedTableData,
        selectedUser,
        setSelectedUser,
        serverStatus,
        setServerStatus,
        setSelectedTable,
        selectedTable,
        currentTable,
        setCurrentTable,
        allDbNames,
        setAllDbNames,
      }}
    >
      {children}
    </DbRelatedContext.Provider>
  );
};
