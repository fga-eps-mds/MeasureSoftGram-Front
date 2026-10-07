import React from 'react';
import { Box, MenuItem, Select, TextField, Typography, Button, SelectChangeEvent } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { COLOR_TOKENS } from '@utils/formatPulseChart';

interface Props {
  repositories: { id: string | number; name: string }[];
  selectedRepo: string;
  onRepoChange: (repoId: string) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  onExportCsv?: () => void;
}

export const PulseChartFilters: React.FC<Props> = ({
  repositories,
  selectedRepo,
  onRepoChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onExportCsv,
}) => {
  const handleSelectRepo = (e: SelectChangeEvent<string>) => {
    onRepoChange(e.target.value);
  };

  return (
    <Box
      display="flex"
      flexWrap="wrap"
      alignItems="center"
      justifyContent="space-between"
      gap={2}
      marginBottom="16px"
    >
      <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
        {/* Repo Selector */}
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Repositório
          </Typography>
          <Select
            size="small"
            value={selectedRepo}
            onChange={handleSelectRepo}
            sx={{
              minWidth: 180,
              backgroundColor: '#FFFFFF',
              borderRadius: '6px',
              fontSize: '13px',
            }}
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
        </Box>

        {/* Start Date */}
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            De
          </Typography>
          <TextField
            type="date"
            size="small"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            sx={{
              backgroundColor: '#FFFFFF',
              borderRadius: '6px',
              '& input': { fontSize: '13px', padding: '8.5px 12px' },
            }}
          />
        </Box>

        {/* End Date */}
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Até
          </Typography>
          <TextField
            type="date"
            size="small"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            sx={{
              backgroundColor: '#FFFFFF',
              borderRadius: '6px',
              '& input': { fontSize: '13px', padding: '8.5px 12px' },
            }}
          />
        </Box>
      </Box>

      {/* Export CSV Button */}
      {onExportCsv && (
        <Button
          variant="outlined"
          size="small"
          onClick={onExportCsv}
          startIcon={<DownloadIcon fontSize="small" />}
          sx={{
            borderColor: COLOR_TOKENS.border,
            color: COLOR_TOKENS.primary,
            textTransform: 'none',
            fontSize: '12px',
            fontWeight: 500,
            '&:hover': {
              borderColor: COLOR_TOKENS.primary,
              backgroundColor: 'rgba(43, 77, 111, 0.04)',
            },
          }}
        >
          exportar .csv
        </Button>
      )}
    </Box>
  );
};

export default PulseChartFilters;
