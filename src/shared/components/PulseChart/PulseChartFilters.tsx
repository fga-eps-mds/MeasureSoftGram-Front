import React, { ReactNode } from 'react';
import { Box, MenuItem, Select, TextField, Typography } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useProviderTerms } from '@hooks/useProviderTerms';
import { COLOR_TOKENS } from '@utils/formatPulseChart';

interface Props {
  /** Sem a lista, a barra mostra só o período e o botão de exportar (pulso das características do repositório). */
  repositories?: { id: string | number; name: string }[];
  selectedRepo?: string;
  onRepoChange?: (repoId: string) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  /** O botão "Exportar .csv" do gráfico (`ExportCsvButton`), logo ao lado do filtro de período. */
  exportAction?: ReactNode;
}

const FIELD_HEIGHT = 40;

// O campo fica sem borda própria: a borda é a do grupo, com o rótulo colado à esquerda (protótipo).
const FIELD_SX = {
  backgroundColor: '#FFFFFF',
  fontSize: '13px',
  '& fieldset': { border: 'none' },
  '& input': { fontSize: '13px', padding: '0 12px', height: `${FIELD_HEIGHT}px` },
};

/** Campo com o rótulo colado à esquerda, dentro da mesma borda: "Repositório | Todos (4)". */
function LabeledField({ label, children }: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <Box
      display="flex"
      alignItems="stretch"
      height={`${FIELD_HEIGHT}px`}
      sx={{ border: `1px solid ${COLOR_TOKENS.border}`, borderRadius: '6px', overflow: 'hidden' }}
    >
      <Typography
        component="span"
        variant="body2"
        fontWeight={500}
        color="text.secondary"
        display="flex"
        alignItems="center"
        paddingX="12px"
        sx={{ backgroundColor: COLOR_TOKENS.bgEven, borderRight: `1px solid ${COLOR_TOKENS.border}`, fontSize: '13px' }}
      >
        {label}
      </Typography>
      {children}
    </Box>
  );
}

export const PulseChartFilters: React.FC<Props> = ({
  repositories,
  selectedRepo,
  onRepoChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  exportAction,
}) => {
  const { terms } = useProviderTerms();
  const handleSelectRepo = (e: SelectChangeEvent<string>) => {
    onRepoChange?.(e.target.value);
  };

  return (
    <Box display="flex" flexWrap="wrap" alignItems="center" gap={2} marginBottom="16px">
      {/* Repo Selector */}
      {repositories && (
        <LabeledField label={terms.Repository}>
          <Select
            size="small"
            value={selectedRepo}
            onChange={handleSelectRepo}
            inputProps={{ 'aria-label': terms.Repository }}
            sx={{ ...FIELD_SX, minWidth: 240, height: `${FIELD_HEIGHT}px` }}
          >
            <MenuItem value="all">
              Todos ({repositories.length})
            </MenuItem>
            {repositories.map((repo) => (
              <MenuItem key={repo.id} value={String(repo.id)}>
                {repo.name}
              </MenuItem>
            ))}
          </Select>
        </LabeledField>
      )}

      {/* Start Date */}
      <LabeledField label="De">
        <TextField
          type="date"
          size="small"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          inputProps={{ 'aria-label': 'De' }}
          sx={FIELD_SX}
        />
      </LabeledField>

      {/* End Date */}
      <LabeledField label="Até">
        <TextField
          type="date"
          size="small"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          inputProps={{ 'aria-label': 'Até' }}
          sx={FIELD_SX}
        />
      </LabeledField>

      {/* Mesma altura dos campos, com a borda na cor primária (protótipo); o botão é o padrão dos dashboards. */}
      {exportAction && (
        <Box
          sx={{
            '& .MuiButton-root': { height: `${FIELD_HEIGHT}px`, fontSize: '13px', paddingX: '16px' },
            '& .MuiButton-root:not(.Mui-disabled)': { borderColor: COLOR_TOKENS.primary },
          }}
        >
          {exportAction}
        </Box>
      )}
    </Box>
  );
};

export default PulseChartFilters;
