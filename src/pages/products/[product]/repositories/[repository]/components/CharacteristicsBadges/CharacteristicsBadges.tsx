import { Box, Tooltip, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import CopyBadgeModal from '../CopyBadgeModal';

function CharacteristicsBadges() {
  const { characteristicBadgeUrls } = useRepositoryContext();
  const { t } = useTranslation('repositories');

  const characteristicKeys = Object.keys(characteristicBadgeUrls || {});

  if (characteristicKeys.length === 0) {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column" gap="8px" marginY="8px">
      <Typography variant="subtitle2" color="text.secondary">
        {t('repository.characteristic-badges', 'Badges de Características')}
      </Typography>
      <Box display="flex" flexWrap="wrap" gap="12px" alignItems="center">
        {characteristicKeys.map((key) => {
          const url = characteristicBadgeUrls[key];
          return (
            <Box key={key} display="flex" alignItems="center" gap="4px">
              <Tooltip title={key} placement="top">
                <img
                  src={url}
                  alt={`${key} Badge`}
                  style={{ height: '20px' }}
                />
              </Tooltip>
              <CopyBadgeModal badgeUrl={url} badgeLabel={key} />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default CharacteristicsBadges;

