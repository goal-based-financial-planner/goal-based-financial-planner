import { Box } from '@mui/material';

type SegmentedControlProps<T extends string> = {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  ariaLabel: string;
};

const SegmentedControl = <T extends string>({ value, options, onChange, ariaLabel }: SegmentedControlProps<T>) => (
  <Box
    role="radiogroup"
    aria-label={ariaLabel}
    sx={{ display: 'inline-flex', p: 0.5, gap: 0.25, borderRadius: 2, backgroundColor: '#F3F3F1' }}
  >
    {options.map((option) => {
      const selected = option.value === value;
      return (
        <Box
          key={option.value}
          component="button"
          type="button"
          role="radio"
          aria-checked={selected}
          onClick={() => onChange(option.value)}
          sx={{
            all: 'unset',
            cursor: 'pointer',
            px: 1.25,
            py: 0.5,
            borderRadius: 1.5,
            fontSize: 12,
            fontWeight: selected ? 600 : 500,
            color: selected ? 'text.primary' : 'text.secondary',
            backgroundColor: selected ? 'background.paper' : 'transparent',
            boxShadow: selected ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
            '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
          }}
        >
          {option.label}
        </Box>
      );
    })}
  </Box>
);

export default SegmentedControl;
