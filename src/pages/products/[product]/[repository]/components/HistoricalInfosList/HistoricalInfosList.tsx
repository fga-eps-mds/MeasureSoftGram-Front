import React from 'react';
import { Box, Container, Typography } from '@mui/material';

import HistoricalInfosTable from './HistoricalInfosTable';
import HistoricalLatestInfos from './HistoricalLatestInfos';
import * as Styles from './styles';

import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { useQuery } from './hooks/useQuery';

interface OptionCheckedProps {
  [key: string]: boolean;
}

interface Prop {
  checkedOptions: OptionCheckedProps;
}

const HistoricalInfosList = ({ checkedOptions }: Prop) => (
  

  <Styles.HistoricalInfosBackground>
    <Container>
      <HistoricalLatestInfos />

      <Box marginTop="44px" marginBottom="36px">
        <Typography variant="h4">Histórico</Typography>
      </Box>

      <HistoricalInfosTable checkedOptions={checkedOptions} />
    </Container>
  </Styles.HistoricalInfosBackground>
);

export default HistoricalInfosList;
