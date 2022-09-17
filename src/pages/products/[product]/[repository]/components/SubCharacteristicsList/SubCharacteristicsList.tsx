import React from 'react';
import { Box, Container, Typography } from '@mui/material';

import SubCharacteristicsTable from './SubCharacteristicsTable';
import * as Styles from './styles';

const SubCharacteristicsList = () => (
  <Styles.SubCharacteristicsBackground>
    <Container>
      <Box marginTop="24px" marginBottom="36px">
        <Typography variant="h5">Histórico</Typography>
      </Box>

      <SubCharacteristicsTable />
    </Container>
  </Styles.SubCharacteristicsBackground>
);

export default SubCharacteristicsList;
