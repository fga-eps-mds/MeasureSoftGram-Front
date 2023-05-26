import React from 'react';
import { Container } from '@mui/material';
import HistoricalLatestInfos from './HistoricalLatestInfos';
import * as Styles from './styles';

interface OptionCheckedProps {
  [key: string]: boolean;
}

interface Prop {
  checkedOptions: OptionCheckedProps;
  currentRepository: any;
}

const HistoricalInfosList = ({ checkedOptions, currentRepository }: Prop) => (
  <Styles.HistoricalInfosBackground>
    <Container>
      <HistoricalLatestInfos checkedOptions={checkedOptions} currentRepository={currentRepository} />
    </Container>
  </Styles.HistoricalInfosBackground>
);

export default HistoricalInfosList;
