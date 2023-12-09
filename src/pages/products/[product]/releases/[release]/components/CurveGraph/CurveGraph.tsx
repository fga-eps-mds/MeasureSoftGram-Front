import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';

export interface CurveGraphProps {
  planejado: number[];
  realizado?: number[];
  labels: string[];
}

export default function SimpleLineChart({ planejado, realizado, labels }: CurveGraphProps) {
  const series: any[] = [
    { data: planejado, label: 'Planejado', color: '#33568E', }
  ]

  if (realizado) {
    series.push({ data: realizado, label: 'Realizado', color: 'red', },)

    if (planejado.length !== realizado.length) {
      return (
        <div>
          <p>O número do resultados das caracteristicas planejadas deve ser igual ao número de realizadas realizadas</p>
        </div>
      );
    }
  }

  if (labels.length !== planejado.length) {
    return (
      <div>
        <p>Quantidade de caracteristicas incompativel com o número de resultados</p>
      </div>
    );
  }

  return (
    <LineChart
      width={700}
      height={400}
      series={series}
      xAxis={[{
        scaleType: 'point',
        data: labels,
        min: 0.0,
        max: 1,
        tickMinStep: 0,
      }]}
      yAxis={[
        {
          scaleType: 'linear',
          min: 0.0,
          max: 1,
        },
      ]}
    />
  );
}
