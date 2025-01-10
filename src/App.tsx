import './App.css';
import { ThemeProvider } from '@emotion/react';
import { theme } from './theme';
import Planner from './pages/Planner';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const App = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={theme}>
        <Planner />
      </ThemeProvider>
    </LocalizationProvider>
  );
};

export default App;
