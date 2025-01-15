import './App.css';
import { ThemeProvider } from '@emotion/react';
import Home from './pages/Home';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import theme from './theme';

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
