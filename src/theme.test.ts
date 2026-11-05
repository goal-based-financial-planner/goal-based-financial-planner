import theme from './theme';

describe('theme', () => {
  it('should have a primary color defined', () => {
    expect(theme.palette.primary.main).toBe('#2E7D32');
  });

  it('should have MuiModal zIndex override', () => {
    expect(theme.components?.MuiModal?.styleOverrides?.root).toEqual({
      zIndex: 2100,
    });
  });

  it('should be a valid MUI theme object', () => {
    expect(theme).toHaveProperty('palette');
    expect(theme).toHaveProperty('components');
  });
});
