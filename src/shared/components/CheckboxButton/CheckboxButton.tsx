import React, { CSSProperties, useState } from 'react';
import { Button } from '@mui/material';

interface CheckboxButtonType {
  label: string;
  checked?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

const CheckboxButton = ({ label, checked = false, onClick, style }: CheckboxButtonType) => {
  const [internalChecked, setChecked] = useState(checked);

  const labelColor = internalChecked ? '#FFF' : '#000';
  const buttonColor = !internalChecked ? '#FFF' : '#000';

  return (
    <div style={style}>
      <input
        type="checkbox"
        checked={internalChecked}
        style={{ position: 'absolute', opacity: 0 }}
        name={label}
        onChange={(_e) => {
          console.log(_e);
        }}
      />
      <Button
        variant="outlined"
        sx={{ backgroundColor: buttonColor, color: labelColor }}
        onClick={() => {
          if (onClick) onClick();
          setChecked(!internalChecked);
        }}
      >
        {label}
      </Button>
    </div>
  );
};

export default CheckboxButton;
