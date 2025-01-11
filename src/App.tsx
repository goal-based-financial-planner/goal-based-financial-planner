import './App.css';
import { ThemeProvider } from '@emotion/react';
import { theme } from './theme';
import Home from './pages/Home';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const App = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={theme}>
        <Home />
      </ThemeProvider>
    </LocalizationProvider>
  );
};

export default App;
