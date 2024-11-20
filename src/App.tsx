import React from 'react';
import './App.css';
import { ThemeProvider } from '@emotion/react';
import { theme } from './theme';
import Planner from './pages/Planner';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Planner />
    </ThemeProvider>
  );
}

export default App;
