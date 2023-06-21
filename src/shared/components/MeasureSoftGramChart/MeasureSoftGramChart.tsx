import React, { useEffect, useState } from 'react';
import ReactEcharts, { EChartsOption } from 'echarts-for-react';
import formatMsgramChart from '@utils/formatMsgramChart';
import { Historical } from '@customTypes/repository';

interface Props {
  historical: Historical[];
  showErrorMessage?: boolean;
}

const MeasureSoftGramChart = ({ historical, showErrorMessage = false }: Props) => {
  const [chartOption, setChartOption] = useState<EChartsOption>({});

  useEffect(() => {
    const formatedOptions = formatMsgramChart({ historical });
    setChartOption(formatedOptions);
  }, [historical]);

  return (
    <ReactEcharts
      option={{
        ...chartOption,
        title: {
          text: `Gráfico MeasureSoftGram`,
          subtext: showErrorMessage && 'Não foi possível carregar os dados do gráfico',
          subtextStyle: {
            color: '#ff0000',
            fontSize: 16
          }
        }
      }}
    />
  );
};

export default MeasureSoftGramChart;
