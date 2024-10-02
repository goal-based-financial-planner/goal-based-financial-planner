import React, { useState } from 'react';
import TextField from '@mui/material/TextField';

const CustomAmountField = ({ value, onChange }: any) => {
  const [inputValue, setInputValue] = useState(value);

  const handleInputChange = (event: any) => {
    const newValue = Math.min(parseInt(event.target.value, 10) || 0, 100);
    setInputValue(newValue.toString());
    onChange(newValue.toString());
  };

  return (
    <TextField
      type="number"
      autoComplete="off"
      value={inputValue}
      onChange={handleInputChange}
      inputProps={{
        min: 0,
        max: 100,
      }}
      style={{
        background: 'white',
        width: '80px',
      }}
    />
  );
};

export default CustomAmountField;
