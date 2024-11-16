import { Typography } from '@mui/material';

export type HeaderProps = {
  title: string;
};

const Header = ({ title }: HeaderProps) => {
  return <Typography sx={{ fontSize: 40 }}>{title}</Typography>;
};

export default Header;
