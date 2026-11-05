import React from 'react';
import { Checkbox, ListItemText, MenuItem, TextField } from '@mui/material';
import { MultiSelection } from '@utils/historicalValues';
import { FilterOption } from './useTemporalEvolution';

const ALL = '__all__';
const SELECT_PROPS = { MenuProps: { disableScrollLock: true } };
const FIELD_SX = { width: 220, backgroundColor: '#FFFFFF' };

interface SingleSelectFilterProps {
  label: string;
  value?: string | number;
  options: { key: string | number; name: string }[];
  onChange: (value: string) => void;
}

export function SingleSelectFilter({ label, value, options, onChange }: SingleSelectFilterProps) {
  return (
    <TextField
      select
      size="small"
      label={label}
      value={value ?? ''}
      onChange={(event) => onChange(String(event.target.value))}
      disabled={options.length === 0}
      sx={FIELD_SX}
      SelectProps={SELECT_PROPS}
    >
      {options.map((option) => (
        <MenuItem key={option.key} value={option.key}>
          {option.name}
        </MenuItem>
      ))}
    </TextField>
  );
}

interface MultiSelectFilterProps {
  label: string;
  value: MultiSelection;
  options: FilterOption[];
  onChange: (value: MultiSelection) => void;
}

/** Filtro de vários valores com a opção "Todas", como as variáveis do dashboard do Grafana. */
export function MultiSelectFilter({ label, value, options, onChange }: MultiSelectFilterProps) {
  const selected = value === 'all' ? [ALL] : value;
  const names = new Map(options.map((option) => [option.key, option.name]));

  const handleChange = (next: string[]) => {
    // "Todas" clicada por último vale sobre as outras; desmarcar tudo também volta para "Todas"
    if (next.length === 0 || next[next.length - 1] === ALL) onChange('all');
    else onChange(next.filter((key) => key !== ALL));
  };

  return (
    <TextField
      select
      size="small"
      label={label}
      value={selected}
      onChange={(event) => handleChange(event.target.value as unknown as string[])}
      disabled={options.length === 0}
      sx={FIELD_SX}
      SelectProps={{
        ...SELECT_PROPS,
        multiple: true,
        renderValue: () => (value === 'all' ? 'Todas' : value.map((key) => names.get(key) ?? key).join(', '))
      }}
    >
      <MenuItem value={ALL}>
        <Checkbox size="small" checked={value === 'all'} />
        <ListItemText primary="Todas" />
      </MenuItem>
      {options.map((option) => (
        <MenuItem key={option.key} value={option.key}>
          <Checkbox size="small" checked={value !== 'all' && value.includes(option.key)} />
          <ListItemText primary={option.name} />
        </MenuItem>
      ))}
    </TextField>
  );
}
