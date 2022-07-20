import Card from '@components/Card';
import { MeasureResult } from '@types/measure';
import React from 'react';
import useQuery from './hook/useQuery';

const Measure = () => {
  const { measure } = useQuery();

  if (!measure) {
    return <>carregando</>;
  }

  return (
    <>
      {measure?.results.map((result: MeasureResult) => (
        <Card title={result.name} value={result.latest.value} />
      ))}
    </>
  );
};

export default Measure;
