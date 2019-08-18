import * as React from 'react';
const { useState, createContext } = React;

export const DbRelatedContext = createContext();

export const DbRelatedProvider = ({ children }) => {
  const [allDbNames, setAllDbNames] = useState<Array<string>>([]);
  const [currentTable, setCurrentTable] = useState<string | null>(null);
  const [tables, setTables] = useState<Array<any>>([]);
  const [selectedDb, setSelectedDb] = useState<string | null>(null);
  const [selectedTableData, setSelectedTableData] = useState<Array<any>>([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [serverStatus, setServerStatus] = useState<boolean>(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [currentComponent, setCurrentComponent] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [refreshStatus, setRefreshStatus] = useState<boolean>(false);
  const [currentlyHighlightedDb, setCurrentlyHighlightedDb] = useState<
    string | null
  >(null);
  const [currentlyHighlightedTable, setCurrentlyHighlightedTable] = useState<
    string | null
  >(null);
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
        setCurrentUser,
        refreshStatus,
        setRefreshStatus,
        currentlyHighlightedDb,
        setCurrentlyHighlightedDb,
        currentlyHighlightedTable,
        setCurrentlyHighlightedTable,
      }}
    >
      {children}
    </DbRelatedContext.Provider>
  );
};
