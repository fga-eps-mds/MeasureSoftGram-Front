import React from 'react';
import { Box, MenuItem, SxProps, TextField, Theme, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useProviderTerms } from '@hooks/useProviderTerms';
import { CorrelationLevel } from '@customTypes/product';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import { CORRELATION_LEVEL_LABELS } from '@utils/formatCorrelationCharts';
import { useCorrelationDashboard } from './useCorrelationDashboard';

const SELECT_PROPS = { MenuProps: { disableScrollLock: true } };
// em tela estreita a lista ocupa a linha toda, e a página não rola na horizontal
const SELECT_SX: SxProps<Theme> = { width: { xs: '100%', sm: 230 }, backgroundColor: '#FFFFFF' };
const TOGGLE_SX: SxProps<Theme> = {
  textTransform: 'none',
  fontWeight: 'bold',
  paddingX: '14px',
  color: DASHBOARD_COLORS.text,
  '&.Mui-selected, &.Mui-selected:hover': { backgroundColor: DASHBOARD_COLORS.primary, color: '#FFFFFF' }
};

const LEVELS: CorrelationLevel[] = ['characteristic', 'subcharacteristic'];

type CorrelationFiltersProps = Pick<
  ReturnType<typeof useCorrelationDashboard>,
  'repositories' | 'repository' | 'setRepositoryId' | 'level' | 'setLevel'
>;

/** Seletores de Relações e Correlações (CA2): o repositório e o nível, característica ou subcaracterística. */
export default function CorrelationFilters({
  repositories,
  repository,
  setRepositoryId,
  level,
  setLevel
}: CorrelationFiltersProps) {
  const { terms } = useProviderTerms();

  return (
    <Box display="flex" alignItems="center" flexWrap="wrap" gap="16px">
      <TextField
        select
        size="small"
        label={terms.Repository}
        value={repository?.id ?? ''}
        onChange={(event) => setRepositoryId(Number(event.target.value))}
        disabled={repositories.length === 0}
        sx={SELECT_SX}
        SelectProps={SELECT_PROPS}
      >
        {repositories.map((item) => (
          <MenuItem key={item.id} value={item.id}>
            {item.name}
          </MenuItem>
        ))}
      </TextField>

      <ToggleButtonGroup
        exclusive
        size="small"
        value={level}
        onChange={(_event, value: CorrelationLevel | null) => {
          if (value) setLevel(value);
        }}
        aria-label="Nível do modelo"
        sx={{ backgroundColor: '#FFFFFF', flexWrap: 'wrap' }}
      >
        {LEVELS.map((item) => (
          <ToggleButton key={item} value={item} sx={TOGGLE_SX}>
            {CORRELATION_LEVEL_LABELS[item]}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
