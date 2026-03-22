import React from 'react';
import './App.css';
import { ThemeProvider } from '@emotion/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import theme from './theme';
import { StorageProviderContextProvider } from './context/StorageProviderContext';
import Home from './pages/Home';

const App = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={theme}>
        <StorageProviderContextProvider>
          <Home />
        </StorageProviderContextProvider>
      </ThemeProvider>
    </LocalizationProvider>
  );
};

export default App;
