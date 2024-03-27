import React, { CSSProperties, useState } from 'react';
import { Button } from '@mui/material';

interface CheckboxButtonType {
  label: string;
  checked?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
  backgroundColor?: string;
  colorHover?: string;
  disabled?: boolean;
}

const CheckboxButton = ({ label, checked = false, onClick, style, backgroundColor, colorHover, disabled }: CheckboxButtonType) => {
  const [internalChecked, setChecked] = useState(checked);

  const labelColor = internalChecked ? '#FFF' : backgroundColor ?? '#000';
  const buttonColor = !internalChecked ? '#FFF' : backgroundColor ?? '#000';

  return (
    <div style={style}>
      <input
        type="checkbox"
        checked={internalChecked}
        style={{ position: 'absolute', opacity: 0 }}
        name={label}
        onChange={(_e) => {

        }}
      />
      <Button
        variant="outlined"
        sx={{
          backgroundColor: buttonColor, color: labelColor,
          '&:hover': {
            color: colorHover
          },
          '&:disabled': {
            color: labelColor,
            opacity: '70%',
          }
        }}
        onClick={() => {
          if (onClick) onClick();
          setChecked(!internalChecked);
        }}
        disabled={disabled ?? false}
      >
        {label}
      </Button>
    </div>
  );
};

export default CheckboxButton;
