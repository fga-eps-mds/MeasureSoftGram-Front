import React from 'react';
import { Box, Container, Typography } from '@mui/material';

import SubCharacteristicsTable from './SubCharacteristicsTable';
import * as Styles from './styles';

interface OptionCheckedProps {
  [key: string]: boolean;
}

interface Prop {
  checkedOptions: OptionCheckedProps;
}

const SubCharacteristicsList = ({ checkedOptions }: Prop) => (
  <Styles.SubCharacteristicsBackground>
    <Container>
      <Box marginTop="24px" marginBottom="36px">
        <Typography variant="h5">Histórico</Typography>
      </Box>

      <SubCharacteristicsTable checkedOptions={checkedOptions} />
    </Container>
  </Styles.SubCharacteristicsBackground>
);

export default SubCharacteristicsList;
