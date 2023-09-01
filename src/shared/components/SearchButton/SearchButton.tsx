import React from 'react';
import { IconButton, TextField } from '@mui/material';
import { Search } from '@mui/icons-material';

interface SearchProps {
  onInput?: React.FormEventHandler<HTMLDivElement>;
  label: string;
  placeHolder?: string;
}

const SearchButton = ({ onInput, label, placeHolder }: SearchProps) => (
  <>
    <IconButton aria-label="search">
      <Search style={{ fill: '#113d4c' }} />
    </IconButton>
    <TextField
      id="search-bar"
      className="text"
      onInput={onInput}
      label={label}
      variant="outlined"
      placeholder={placeHolder ?? 'Buscar...'}
      size="small"
    />
  </>
);

export default SearchButton;
