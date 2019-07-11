import React, { useState, createContext } from 'react';

export const DbRelatedContext = createContext();

export const DbRelatedProvider = ({ children }) => {
  const [allDbNames, setAllDbNames] = useState([]);
  const [currentTable, setCurrentTable] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedDb, setSelectedDb] = useState(null);
  const [selectedTableData, setSelectedTableData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [serverStatus, setServerStatus] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [currentComponent, setCurrentComponent] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
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
        currentComponent,
        setCurrentComponent,
        currentUser,
        setCurrentUser
      }}
    >
      {children}
    </DbRelatedContext.Provider>
  );
};
