import { createTheme, PaletteOptions, Theme } from '@mui/material';

const customPalette: PaletteOptions = {
  primary: {
    main: '#008000',
  },
};
const theme: Theme = createTheme({
  palette: customPalette,
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
