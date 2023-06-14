import React, { useEffect, useState } from 'react';
import ReactEcharts, { EChartsOption } from 'echarts-for-react';
import formatMsgramChart from '@utils/formatMsgramChart';
import { Historical } from '@customTypes/repository';

interface Props {
  historical: Historical[];
}

const MeasureSoftGramChart = ({ historical }: Props) => {
  const [chartOption, setChartOption] = useState<EChartsOption>({});

  useEffect(() => {
    const formatedOptions = formatMsgramChart({ historical });
    setChartOption(formatedOptions);
  }, [historical]);

  return <ReactEcharts option={chartOption} />;
};

export default MeasureSoftGramChart;
