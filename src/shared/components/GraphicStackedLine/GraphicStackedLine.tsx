import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactEcharts, { EChartsOption } from 'echarts-for-react';

import formatCharacteristicsHistory from '@utils/formatCharacteristicsHistory';
import { Historical } from '@customTypes/repository';

import * as Styles from './styles';

interface OptionCheckedProps {
  [key: string]: boolean;
}

interface Prop {
  historical?: Historical[];
  checkedOptions: OptionCheckedProps;
  title: string;
  getDates?: (startDate: string, endDate: string) => void;
  selected?: (arg: any) => boolean;
}

const GraphicStackedLine = ({ historical, checkedOptions, title, getDates, selected }: Prop) => {
  const chartRef = useRef<ReactEcharts>(null);
  const [chartOption, setChartOption] = useState<EChartsOption>({});

  useEffect(() => {
    const formatedOptions = formatCharacteristicsHistory({ historical, checkedOptions, title, selected });
    setChartOption(formatedOptions);
  }, [historical, checkedOptions]);

  const onDateZoom = useCallback(() => {
    if (chartRef.current) {
      const option = chartRef.current.getEchartsInstance().getOption();
      const data = option.dataZoom as any;
      const { startValue, endValue } = data[0];
      const dates = chartOption.xAxis.data;

      if (getDates) {
        getDates(dates[startValue], dates[endValue]);
      }
    }
  }, [chartRef.current]);

  const onEvents = {
    dataZoom: onDateZoom
  };

  return (
    <Styles.GraphicContainer>
      <Styles.StackedLineStyled ref={chartRef} option={chartOption} onEvents={onEvents} />
    </Styles.GraphicContainer>
  );
};

export default GraphicStackedLine;
