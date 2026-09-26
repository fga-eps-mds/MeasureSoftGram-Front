// components/Button.tsx
import { Button } from '@mui/material';
import React from 'react';
import styled from 'styled-components';

interface MSGButtonProps {
  primary?: boolean;
  fullWidth?: boolean;
}

const MSGButtonStyle = styled(Button)<MSGButtonProps>(() => ({
  height: '50px',
  borderColor: '#2B4D6F',
  borderRadius: '5px',
  fontFamily: ['Montserrat', 'sans-serif'].join(','),
  fontWeight: 500,
  fontSize: '14px',
  '&:hover': {
    backgroundColor: '#165870',
    color: 'white',
    borderColor: '#165870',
    boxShadow: 'none',
  },
}));

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  width?: string | number;
  variant?: 'primary' | 'secondary';
}

const MSGButton: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  width,
  variant = 'primary'
}) => (
  <MSGButtonStyle
    // eslint-disable-next-line react/button-has-type
    type={type}
    onClick={onClick}
    disabled={disabled}
    style={{ width }}
    variant={variant === 'primary' ? 'contained' : 'outlined'}
    className={`${className}`}
  >
    {children}
  </MSGButtonStyle >
);

export default MSGButton;
