import * as echarts from 'echarts/core';
import {
  BarChart,
  BoxplotChart,
  CustomChart,
  GaugeChart,
  LineChart,
  RadarChart,
  ScatterChart,
  TreeChart
} from 'echarts/charts';
import {
  AriaComponent,
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkAreaComponent,
  MarkLineComponent,
  RadarComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  VisualMapComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import EChartsReactCore from 'echarts-for-react/lib/core';
import type { EChartsReactProps } from 'echarts-for-react/lib/types';

// só os gráficos e componentes que as telas usam: o pacote completo do ECharts tem um terço a mais
echarts.use([
  BarChart,
  BoxplotChart,
  CustomChart,
  GaugeChart,
  LineChart,
  RadarChart,
  ScatterChart,
  TreeChart,
  AriaComponent,
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  MarkAreaComponent,
  MarkLineComponent,
  RadarComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  VisualMapComponent,
  CanvasRenderer
]);

export { echarts };

/** O mesmo componente do echarts-for-react, com o ECharts montado só com as partes registradas acima. */
export default class ECharts extends EChartsReactCore {
  constructor(props: EChartsReactProps) {
    super(props);
    this.echarts = echarts;
  }
}
