import React from 'react';
import { Container} from '@mui/material';
import HistoricalLatestInfos from './HistoricalLatestInfos';
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
      <HistoricalLatestInfos checkedOptions={checkedOptions}/>
    </Container>
  </Styles.HistoricalInfosBackground>
);

export default HistoricalInfosList;
