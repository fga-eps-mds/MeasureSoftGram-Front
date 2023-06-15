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
    return <Skeleton variant="rectangular" width="100%" height="300px" />;
  }

  if (error || !data) {
    return <Typography variant="h6">Não há dados</Typography>;
  }

  return (
    <Box
      height={`${data.length * 82 + 80}px`}
      bgcolor="white"
      borderRadius="20px"
      paddingX="20px"
      paddingY="10px"
      marginBottom="10px"
    >
      <MeasureSoftGramChart historical={data} />
      teste
    </Box>
  );
}

export default CurrentReleaseCharacteristicsChart;
