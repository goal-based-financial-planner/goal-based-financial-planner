import React, { ReactNode } from 'react';
import Button from '@mui/material/Button';

interface CustomButtonProps {
  text: string;
  icon: ReactNode;
  onClick: () => void;
}

const CustomButton: React.FC<CustomButtonProps> = ({ text, icon, onClick }) => {
  return (
    <Button startIcon={icon} onClick={onClick}>
      {text}
    </Button>
  );
};

export default CustomButton;
