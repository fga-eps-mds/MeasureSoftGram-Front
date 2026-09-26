import { LineChart } from '@mui/x-charts';
import { Characteristic } from '@customTypes/product';
import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from "react-i18next";

export interface CustomLineChartProps {
  planned: Characteristic[];
  accomplised: Characteristic[];
  hasArea?: boolean;
}

export default function CustomLineChart({ planned, accomplised, hasArea = false }: CustomLineChartProps) {
  const { t } = useTranslation('release');

  const [labelsChart, setLabelsChart] = useState<string[]>([]);
  const [plannedChart, setPlannedChart] = useState<number[]>([]);
  const [accomplishedChart, setAccomplishedChart] = useState<number[]>([]);
  const [diffChart, setDiffChart] = useState<number[]>([]);

  const colors = {
    planned: '#1E6A85',
    accomplished: '#43285B',
    diff: '#04724D'
  }

  const series: any[] = [
    { data: plannedChart, label: t('planned'), color: colors.planned, connectNulls: true, area: hasArea },
    { data: accomplishedChart, label: t('accomplised'), color: colors.accomplished, connectNulls: true, area: hasArea },
    { data: diffChart, label: t('diff'), color: colors.diff, connectNulls: true, area: hasArea }
  ]

  useEffect(() => {
    let index = 0;
    const labelsAux: any[] = []
    const plannedAux: any[] = []
    const accomplishedAux: any = []
    const diffAux: any = []

    planned.forEach((characteristic) => {
      addEmptyValueToChart(index += 1, labelsAux, plannedAux, accomplishedAux, diffAux);

      const accomplishedCharacteristic = accomplised.find(el => el.name === characteristic.name)

      if (accomplishedCharacteristic) {

        accomplishedAux.push(accomplishedCharacteristic.value)
        diffAux.push(accomplishedCharacteristic.diff)
        labelsAux.push(t(`characteristics.${characteristic.name}`))
        plannedAux.push(characteristic.value)

        addEmptyValueToChart(index += 1, labelsAux, plannedAux, accomplishedAux, diffAux);
      }
    })

    setLabelsChart(labelsAux)
    setPlannedChart(plannedAux)
    setAccomplishedChart(accomplishedAux)
    setDiffChart(diffAux)

  }, [planned, accomplised])

  const addEmptyValueToChart = (index: number, labelsAux: any[], plannedAux: any[], accomplishedAux: any, diffAux: any) => {
    plannedAux.push(null)
    accomplishedAux.push(null)
    diffAux.push(null)
    labelsAux.push(index)
  }

  return (
    <Box position='absolute' >
      <LineChart
        width={900}
        height={400}
        series={series}
        data-testid='release-chart'
        xAxis={[{
          scaleType: 'point',
          data: labelsChart,
        }]}
        yAxis={[
          {
            scaleType: 'linear',
            min: 0.0,
            max: 1,
          },
        ]}
        sx={{
          '& .MuiLineElement-root': {
            strokeWidth: 6,
          },
          '& .MuiChartsAxis-directionX .MuiChartsAxis-tickContainer ': {
            display: 'none',
          },
          '& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel': {
            display: 'none',
          },
          '& .MuiAreaElement-root:nth-child(1)': {
            fill: 'url(#gradient_planned)',
          },
          '& .MuiAreaElement-root:nth-child(2)': {
            fill: 'url(#gradient_accomplished)',
          },
          '& .MuiAreaElement-root:nth-child(3)': {
            fill: 'url(#gradient_diff)',
          }
        }}
      >
        <defs>
          <linearGradient id="gradient_planned" x1="300.25" y1="46.9999" x2="200.25" y2={`${600}px`} gradientUnits="userSpaceOnUse">
            <stop stopColor={colors.planned} stopOpacity="0.3" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <defs>
          <linearGradient id="gradient_accomplished" x1="300.25" y1="46.9999" x2="200.25" y2={`${600}px`} gradientUnits="userSpaceOnUse">
            <stop stopColor={colors.accomplished} stopOpacity="0.3" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <defs>
          <linearGradient id="gradient_diff" x1="300.25" y1="46.9999" x2="200.25" y2={`${600}px`} gradientUnits="userSpaceOnUse">
            <stop stopColor={colors.diff} stopOpacity="0.3" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </LineChart>
    </Box>
  )
}
