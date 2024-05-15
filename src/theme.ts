import { responsiveFontSizes, createTheme } from '@mui/material';

export const theme = responsiveFontSizes(
  createTheme({
    components: {
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            fontSize: '2em',
            color: 'black',
            backgroundColor: 'hsl(0,0%,70%)',
          },
          arrow: {
            color: 'hsl(0,0%,70%)',
          },
        },
      },
    },
  }),
);
