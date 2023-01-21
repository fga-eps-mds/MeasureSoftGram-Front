import React from 'react';
import { Box, Container, Typography } from '@mui/material';

import HistoricalInfosTable from './HistoricalInfosTable';
import * as Styles from './styles';

interface OptionCheckedProps {
  [key: string]: boolean;
}

interface Prop {
  checkedOptions: OptionCheckedProps;
}

const HistoricalInfosList = ({ checkedOptions }: Prop) => (
  <Styles.HistoricalInfosBackground>
    <Container>
      <Box marginTop="24px" marginBottom="36px">
        <Typography variant="h5">Histórico</Typography>
      </Box>

      <HistoricalInfosTable checkedOptions={checkedOptions} />
    </Container>
  </Styles.HistoricalInfosBackground>
);

export default HistoricalInfosList;
