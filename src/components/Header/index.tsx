import { Box, Typography } from '@mui/material';

export type HeaderProps = {
  title: string;
  iconName: string;
  onAction: () => void;
};

const Header = ({ title, iconName, onAction }: HeaderProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        padding: 3,
        alignItems: 'center',
      }}
    >
      <Typography sx={{ fontSize: 40 }}>{title}</Typography>
      <Box
        ml={3}
        onClick={onAction}
        sx={{
          '&:hover': {
            cursor: 'pointer',
            transform: 'scale(1.05)',
          },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <span
          className="material-symbols-rounded"
          style={{
            fontSize: '40px',
            transition: 'color 0.3s ease',
            fontWeight: 'bold',
          }}
        >
          {iconName}
        </span>
      </Box>
    </Box>
  );
};

export default Header;
