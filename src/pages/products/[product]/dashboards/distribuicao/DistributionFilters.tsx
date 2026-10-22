import React from 'react';
import { Box, MenuItem, SxProps, TextField, Theme, ToggleButton, ToggleButtonGroup } from '@mui/material';
import ReleaseSelect from '@components/ReleaseSelect';
import { useProviderTerms } from '@hooks/useProviderTerms';
import { DistributionLevel } from '@customTypes/product';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import { DISTRIBUTION_LEVEL_LABELS, DISTRIBUTION_LEVELS } from '@utils/distributionCascade';
import { useDistributionDashboard } from './useDistributionDashboard';

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

/** A seleção do hook da página, com os setters dele. */
type DistributionFiltersProps = Pick<
  ReturnType<typeof useDistributionDashboard>,
  | 'releases'
  | 'release'
  | 'currentRelease'
  | 'setReleaseId'
  | 'isLoadingReleases'
  | 'repositories'
  | 'repository'
  | 'setRepositoryId'
  | 'level'
  | 'setLevel'
  | 'selectors'
  | 'setEntity'
>;

/**
 * Seletores da Distribuição Estatística (CA2): release, repositório e nível na primeira linha e, abaixo do TSQMI, a
 * entidade em cascata, um seletor por nível do topo até o escolhido.
 */
export default function DistributionFilters({
  releases,
  release,
  currentRelease,
  setReleaseId,
  isLoadingReleases,
  repositories,
  repository,
  setRepositoryId,
  level,
  setLevel,
  selectors,
  setEntity
}: DistributionFiltersProps) {
  const { terms } = useProviderTerms();

  return (
    <Box display="flex" flexDirection="column" gap="16px">
      <Box display="flex" alignItems="center" flexWrap="wrap" gap="16px">
        <ReleaseSelect
          releases={releases}
          value={release?.id}
          currentReleaseId={currentRelease?.id}
          onChange={setReleaseId}
          disabled={isLoadingReleases}
        />

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
              {item.tsqmi.value === null ? `${item.name} (sem análise na release)` : item.name}
            </MenuItem>
          ))}
        </TextField>

        <ToggleButtonGroup
          exclusive
          size="small"
          value={level}
          onChange={(_event, value: DistributionLevel | null) => {
            if (value) setLevel(value);
          }}
          aria-label="Nível do modelo"
          sx={{ backgroundColor: '#FFFFFF', flexWrap: 'wrap' }}
        >
          {DISTRIBUTION_LEVELS.map((item) => (
            <ToggleButton key={item} value={item} sx={TOGGLE_SX}>
              {DISTRIBUTION_LEVEL_LABELS[item]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {selectors.length > 0 && (
        <Box display="flex" alignItems="center" flexWrap="wrap" gap="16px" data-testid="entity-selectors">
          {selectors.map((selector) => (
            <TextField
              key={selector.level}
              select
              size="small"
              label={selector.label}
              value={selector.value ?? ''}
              onChange={(event) => setEntity(selector.level, String(event.target.value))}
              disabled={selector.options.length === 0}
              sx={SELECT_SX}
              SelectProps={SELECT_PROPS}
            >
              {selector.options.map((option) => (
                <MenuItem key={option.key} value={option.key}>
                  {option.name}
                </MenuItem>
              ))}
            </TextField>
          ))}
        </Box>
      )}
    </Box>
  );
}
