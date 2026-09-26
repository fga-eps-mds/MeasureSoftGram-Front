import { Box, IconButton, Tooltip } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TsqmiValue } from '@customTypes/product';
import CopyBadgeModal from '../CopyBadgeModal';

const BADGE_STALENESS_DAYS = 30;

interface TsqmiBadgeProps {
  latestTSQMI: TsqmiValue;
  latestTSQMIBadgeUrl: string;
  showCopyButton?: boolean;
}

function TsqmiBadge({ latestTSQMI, latestTSQMIBadgeUrl, showCopyButton = true }: TsqmiBadgeProps) {
  const { t } = useTranslation('repositories');

  const isStale = useMemo(() => {
    if (!latestTSQMI?.created_at) return true;
    const createdAt = new Date(latestTSQMI.created_at).getTime();
    const now = Date.now();
    const diffDays = (now - createdAt) / (1000 * 60 * 60 * 24);
    return diffDays > BADGE_STALENESS_DAYS;
  }, [latestTSQMI]);

  const shouldShowStaleWarning = showCopyButton && isStale;

  if (!latestTSQMIBadgeUrl) {
    return null;
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap="8px"
      marginY="16px"
    >
      <Box display="flex" alignItems="center" gap="8px">
        <Tooltip title={t('repository.badge-tooltip', 'Qualidade do repositório')} placement="bottom">
          <img
            src={latestTSQMIBadgeUrl}
            alt="TSQMI Badge"
            style={{ width: '158px', height: '20px' }}
          />
        </Tooltip>
        {shouldShowStaleWarning && (
          <Tooltip
            title={t('repository.badge-stale-tooltip', 'Badge desatualizada. Execute uma nova análise para atualizar os dados.')}
            placement="bottom"
          >
            <IconButton
              size="small"
              aria-label={t('repository.badge-stale-label', 'Badge desatualizada')}
              color="warning"
            >
              <WarningAmberIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {showCopyButton && <CopyBadgeModal />}
      </Box>
    </Box>
  );
}

export default TsqmiBadge;
