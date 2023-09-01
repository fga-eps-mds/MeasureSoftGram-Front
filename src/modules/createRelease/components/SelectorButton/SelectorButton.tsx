import { Button, SxProps } from "@mui/material"
import React from 'react';

interface SelectorButtonProps {
  onClick: () => void;
  label: string;
  startIcon?: React.ReactNode;
  sx?: SxProps;
}

const SelectorButton = ({ onClick, label, startIcon, sx }: SelectorButtonProps) => (
  <Button variant="outlined" onClick={onClick}
    sx={{
      backgroundColor: "#fff",
      color: "#113d4c",
      '&:hover': {
        backgroundColor: "#73bfb8",
        color: "#fff"
      },
      padding: '20px',
      ...sx
    }}
    startIcon={startIcon}>
    {label}
  </Button>
)

export default SelectorButton;
