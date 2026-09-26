import React from 'react';
import { InputAdornment, TextField } from '@mui/material';
import { Search } from '@mui/icons-material';

interface SearchProps {
  onInput?: React.FormEventHandler<HTMLDivElement>;
  label?: string;
  placeHolder?: string;
}

const SearchButton = ({ onInput, label, placeHolder }: SearchProps) => (
  <TextField
    data-testid="input"
    id="search-bar"
    aria-label={label ?? 'search-bar-label'}
    className="text"
    onInput={onInput}
    label={label}
    variant="outlined"
    placeholder={placeHolder ?? 'Buscar...'}
    size="small"
    style={{
      minWidth: '250px'
    }}
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <Search style={{ fill: '#2B4D6F' }} />
        </InputAdornment>
      ),
    }}
  />
);

export default SearchButton;
