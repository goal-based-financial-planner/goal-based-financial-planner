import { createTheme } from '@mui/material';

let theme = createTheme({
  typography: {
    h1: {
      fontSize: '2rem',
      // '@media (min-width:600px)': {
      //   fontSize: '2.5rem',
      // },
      '@media (min-width:960px)': {
        fontSize: '3rem',
      },
    },
    h2: {
      fontSize: '1.75rem',
      '@media (min-width:600px)': {
        fontSize: '2.25rem',
      },
      '@media (min-width:960px)': {
        fontSize: '2.75rem',
      },
    },
    h3: {
      fontSize: '1.5rem',
      '@media (min-width:600px)': {
        fontSize: '2rem',
      },
      '@media (min-width:960px)': {
        fontSize: '2.5rem',
      },
    },
    h4: {
      fontSize: '1.25rem',
      '@media (min-width:600px)': {
        fontSize: '1.5rem',
      },
      '@media (min-width:960px)': {
        fontSize: '2rem',
      },
    },
    h5: {
      fontSize: '1rem',
      '@media (min-width:600px)': {
        fontSize: '1.25rem',
      },
      '@media (min-width:960px)': {
        fontSize: '1.5rem',
      },
    },
    h6: {
      // fontSize: '0.875rem',
      // '@media (min-width:600px)': {
      //   fontSize: '1rem',
      // },
      // '@media (min-width:960px)': {
      //   fontSize: '1.25rem',
      // },
    },
    subtitle1: {
      fontSize: '1rem',
      '@media (min-width:600px)': {
        fontSize: '1.125rem',
      },
      '@media (min-width:960px)': {
        fontSize: '1.25rem',
      },
    },
    subtitle2: {
      fontSize: '0.875rem',
      '@media (min-width:600px)': {
        fontSize: '1rem',
      },
      '@media (min-width:960px)': {
        fontSize: '1.125rem',
      },
    },
    body1: {
      fontSize: '1rem',
      '@media (min-width:600px)': {
        fontSize: '1.125rem',
      },
      '@media (min-width:960px)': {
        fontSize: '1.25rem',
      },
    },
    // body2: {
    //   fontSize: '0.875rem',
    //   '@media (min-width:600px)': {
    //     fontSize: '1rem',
    //   },
    //   '@media (min-width:960px)': {
    //     fontSize: '1.125rem',
    //   },
    // },
    button: {
      fontSize: '0.875rem',
      '@media (min-width:600px)': {
        fontSize: '0.875rem',
      },
      '@media (min-width:960px)': {
        fontSize: '0.875rem',
      },
    },
    caption: {
      fontSize: '0.75rem',
      '@media (min-width:600px)': {
        fontSize: '0.875rem',
      },
      '@media (min-width:960px)': {
        fontSize: '1rem',
      },
    },
    overline: {
      fontSize: '0.625rem',
      '@media (min-width:600px)': {
        fontSize: '0.75rem',
      },
      '@media (min-width:960px)': {
        fontSize: '0.875rem',
      },
    },
  },
  components: {
    MuiModal: {
      styleOverrides: {
        root: {
          zIndex: 2100,
        },
      },
    },
  },
});

export default theme;
