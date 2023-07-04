import { Button } from "@mui/material"
import React from 'react';

interface SelectorButtonProps {
  onClick: () => void;
  label: string
}

export const SelectorButton = ({ onClick, label }: SelectorButtonProps) => (
  <Button variant="outlined" onClick={onClick}
    sx={{
      backgroundColor: "#fff",
      color: "#113d4c",
      '&:hover': {
        backgroundColor: "#73bfb8",
        color: "#fff"
      },
      padding: '20px',
      marginBottom: '30px'
    }}>
    {label}
  </Button>
)
