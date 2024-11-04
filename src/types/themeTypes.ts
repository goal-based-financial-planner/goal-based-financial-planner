import { SimplePaletteColorOptions } from '@mui/material';

interface AdditionalPalette {
  header: SimplePaletteColorOptions;
  leftPanel: SimplePaletteColorOptions;
  rightPanel: SimplePaletteColorOptions;
}

declare module '@mui/material/styles' {
  interface Palette extends AdditionalPalette {}
  interface PaletteOptions extends AdditionalPalette {}
}
