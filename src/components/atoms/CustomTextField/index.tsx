/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import {
  type FilledTextFieldProps,
  TextField,
  type TextFieldVariants,
  type StandardTextFieldProps,
  type OutlinedTextFieldProps,
} from '@mui/material';
import React, { useState } from 'react';

export interface CustomTextFieldProps {
  maxLength?: number;
  minLength?: number;
  regex?: RegExp;
  onChange?: (text: string) => void;
  onBlur?: (text: string) => void;
  handleError?: boolean;
  disableRequiredErrorMessage?: boolean;
  additionalHelperText?: string;
  isEnterOperable?: boolean;
  isPasteDisabled?: boolean;
}

export type TextFieldProps<
  Variant extends TextFieldVariants = TextFieldVariants,
> = Variant extends 'filled'
  ? Omit<FilledTextFieldProps, 'onChange' | 'onBlur'>
  : Variant extends 'standard'
    ? Omit<StandardTextFieldProps, 'onChange' | 'onBlur'>
    : Omit<OutlinedTextFieldProps, 'onChange' | 'onBlur'>;

const CustomTextField = ({
  type = 'text',
  label,
  id,
  value,
  onChange,
  onBlur,
  helperText,
  required,
  maxLength,
  minLength,
  regex,
  sx,
  handleError = false,
  error,
  disableRequiredErrorMessage = false,
  additionalHelperText,
  isEnterOperable = false,
  isPasteDisabled = false,
  ...rest
}: CustomTextFieldProps & TextFieldProps) => {
  const [validateField, setValidateField] = useState(false);
  const [invalidChar, setInvalidChar] = useState(false);
  const isValidLength = (text: string) =>
    (!required || (required && text?.length)) &&
    (!minLength || text?.length === 0 || text?.length >= minLength) &&
    (!maxLength || text?.length === 0 || text?.length <= maxLength);
  const isValidString = (text: string) =>
    text?.length === 0 || !regex || regex?.test(text);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target?.value;

    setInvalidChar(false);
    if (isValidString(text)) {
      setValidateField(false);
      onChange?.(text);
    } else {
      setValidateField(true);
      setInvalidChar(true);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const text = e.target?.value;
    setInvalidChar(false);
    if (!isValidLength(text)) {
      setValidateField(true);
    }

    onBlur?.(text);
  };

  document.addEventListener('wheel', () => {
    const activeEl = document.activeElement as HTMLInputElement;
    if (activeEl.type === 'number') {
      activeEl.blur();
    }
  });

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const inputChar = event.key;
    if (type === 'number' && !isValidString(String(value) + inputChar)) {
      event.preventDefault();
      setInvalidChar(true);
    }
    if (String(value).length === maxLength && event.key !== 'Enter') {
      setInvalidChar(true);
    }

    if (isEnterOperable && event.key === 'Enter') {
      setInvalidChar(false);
      setValidateField(true);
    }
  };

  const isInValid =
    invalidChar ||
    ((validateField || handleError) &&
      (!isValidString(value as string) || !isValidLength(value as string)));

  const getHelperText = () => {
    if (
      required &&
      String(value).length === 0 &&
      !invalidChar &&
      !disableRequiredErrorMessage
    ) {
      return '*Required';
    }

    return isInValid ? helperText : additionalHelperText ?? helperText;
  };

  const handlePaste: React.ClipboardEventHandler<HTMLDivElement> = (event) => {
    if (isPasteDisabled) {
      event.preventDefault();
    }
  };

  return (
    <TextField
      type={type}
      autoComplete="off"
      variant="standard"
      id={id}
      required={required}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyPress={handleKeyPress}
      helperText={error || isInValid ? getHelperText() : ''}
      error={error || isInValid}
      sx={{
        ...sx,
      }}
      onPaste={handlePaste}
      {...rest}
    />
  );
};

export default CustomTextField;
