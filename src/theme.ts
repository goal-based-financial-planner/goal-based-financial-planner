import { createTheme, PaletteOptions, Theme } from '@mui/material';

const customPalette: PaletteOptions = {
  primary: {
    main: '#2E7D32',
    light: '#EAF3E6',
    dark: '#1F5F23',
    contrastText: '#FFFFFF',
  },
  error: { main: '#E5484D', light: '#FDECEC' },
  warning: { main: '#E8772E', light: '#FDEBDD' },
  info: { main: '#4C6EF5', light: '#E7ECFE' },
  success: { main: '#2E7D32', light: '#E6F4E3' },
  text: {
    primary: '#111111',
    secondary: '#6B7280',
    disabled: '#9CA3AF',
  },
  divider: '#ECECEA',
  background: {
    default: '#F8F8F7',
    paper: '#FFFFFF',
  },
};

const theme: Theme = createTheme({
  palette: customPalette,
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    button: { textTransform: 'none', fontWeight: 600 },
    overline: { fontWeight: 500, letterSpacing: '0.08em' },
  },
  components: {
    MuiModal: {
      styleOverrides: {
        root: {
          zIndex: 2100,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8 },
        outlined: { borderColor: '#E5E5E3' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 14 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
  },
});

export default theme;
