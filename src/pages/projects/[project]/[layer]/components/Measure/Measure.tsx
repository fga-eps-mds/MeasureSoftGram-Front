import Card from '@components/Card';
import { MeasureResult } from '@types/measure';
import React from 'react';
import useQuery from './hook/useQuery';

import Styles from './styles';

const Measure = () => {
  const { measure } = useQuery();

  if (!measure) {
    return <>carregando</>;
  }

  return (
    <Styles.MeasureWrapper>
      {measure?.results.map((result: MeasureResult) => (
        <Card title={result.name} value={result.latest.value} />
      ))}
    </Styles.MeasureWrapper>
  );
};

export default Measure;
