import { responsiveFontSizes, createTheme } from '@mui/material';

export const theme = responsiveFontSizes(
  createTheme({
    palette: {
      primary: {
        main: '#015c92',
      },
      text: {
        primary: '#190933',
      },
      leftPanel: {
        main: '#88CDF6',
      },
      rightPanel: {
        main: '#FFFFFF',
      },
      header: {
        main: '#6E7F9A',
      },
    },
  }),
);
