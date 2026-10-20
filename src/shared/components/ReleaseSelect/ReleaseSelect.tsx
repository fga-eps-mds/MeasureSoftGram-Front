import React from 'react';
import { MenuItem, TextField } from '@mui/material';
import { IReleases } from '@customTypes/product';
import { sortReleasesByStart } from '@utils/releaseSelection';

export interface ReleaseSelectProps {
  releases: IReleases[];
  value?: number;
  onChange: (releaseId: number) => void;
  /** Release marcada como "(atual)" na lista. */
  currentReleaseId?: number;
  disabled?: boolean;
}

/** Seletor de release dos dashboards, da release mais nova para a mais antiga. */
export default function ReleaseSelect({ releases, value, onChange, currentReleaseId, disabled }: ReleaseSelectProps) {
  return (
    <TextField
      select
      size="small"
      label="Release"
      value={value ?? ''}
      onChange={(event) => onChange(Number(event.target.value))}
      disabled={disabled || releases.length === 0}
      sx={{ width: 230, backgroundColor: '#FFFFFF' }}
      SelectProps={{ MenuProps: { disableScrollLock: true } }}
    >
      {sortReleasesByStart(releases).map((release) => (
        <MenuItem key={release.id} value={release.id}>
          {release.id === currentReleaseId ? `${release.release_name} (atual)` : release.release_name}
        </MenuItem>
      ))}
    </TextField>
  );
}
