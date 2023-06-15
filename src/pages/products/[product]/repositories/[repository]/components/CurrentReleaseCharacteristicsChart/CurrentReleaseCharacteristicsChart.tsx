import MeasureSoftGramChart from '@components/MeasureSoftGramChart/MeasureSoftGramChart';
import { useHistoricalCharacteristics } from '@hooks/useHistoricalCharacteristics';
import { Box, Skeleton, Typography } from '@mui/material';
import React from 'react';

interface Props {
  repositoryId: string;
}

function CurrentReleaseCharacteristicsChart({ repositoryId }: Props) {
  const { data, error, isLoading } = useHistoricalCharacteristics(repositoryId);

  if (isLoading) {
    return (
      <Skeleton
        data-testid="current-release-characteristics-chart-loading"
        variant="rectangular"
        width="100%"
        height="300px"
      />
    );
  }

  return (
    <Box
      data-testid="current-release-characteristics-chart"
      height={`${data.length * 82 + 80}px`}
      bgcolor="white"
      borderRadius="20px"
      paddingX="20px"
      paddingY="10px"
      marginBottom="10px"
    >
      <MeasureSoftGramChart historical={data} />
      {error && <Typography variant="h6">Não existem dados para serem exibidos</Typography>}
    </Box>
  );
}

export default CurrentReleaseCharacteristicsChart;
