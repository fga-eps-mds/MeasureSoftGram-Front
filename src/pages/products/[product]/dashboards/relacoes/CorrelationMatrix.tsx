import React, { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import DashboardCard from '@components/DashboardCard';
import ExportCsvButton from '@components/ExportCsvButton';
import { RepositoryCorrelation } from '@customTypes/product';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import {
  CORRELATION_COLORS,
  CORRELATION_CSV,
  CORRELATION_LEVEL_PLURALS,
  formatCorrelationCsv,
  formatCorrelationMatrixOptions,
  formatSignificanceNote,
  METHOD_LABELS
} from '@utils/formatCorrelationCharts';
import CorrelationChart from './CorrelationChart';

export function matrixTitle(correlation: Pick<RepositoryCorrelation, 'level'>): string {
  return `Matriz de correlação das ${CORRELATION_LEVEL_PLURALS[correlation.level]}`;
}

/** Escala de −1 a +1, do laranja ao azul. */
function ScaleLegend() {
  return (
    <Box display="flex" alignItems="center" gap="8px" aria-hidden>
      <Typography fontSize="12px" color={DASHBOARD_COLORS.text}>
        −1
      </Typography>
      <Box
        width={160}
        height={10}
        borderRadius="5px"
        sx={{
          background: `linear-gradient(to right, ${CORRELATION_COLORS.negative}, ${CORRELATION_COLORS.neutral}, ${CORRELATION_COLORS.positive})`
        }}
      />
      <Typography fontSize="12px" color={DASHBOARD_COLORS.text}>
        +1
      </Typography>
    </Box>
  );
}

/**
 * Matriz de correlação (CA4): o triângulo de baixo de RD_Corr, com o nome de cada entidade na diagonal, o coeficiente
 * com duas casas na cor da escala de −1 a +1 e os não significativos em itálico e opacos.
 */
export default function CorrelationMatrix({ correlation }: { correlation: RepositoryCorrelation }) {
  const option = useMemo(() => formatCorrelationMatrixOptions(correlation), [correlation]);
  const noun = CORRELATION_LEVEL_PLURALS[correlation.level];
  const method = correlation.method ? METHOD_LABELS[correlation.method] : '';

  return (
    <DashboardCard
      title={matrixTitle(correlation)}
      status="ready"
      headerAction={
        <ExportCsvButton
          dashboard={CORRELATION_CSV.dashboard}
          chart={formatCorrelationCsv(correlation, CORRELATION_CSV.matrix)}
        />
      }
    >
      <Typography fontSize="13px" color={DASHBOARD_COLORS.text}>
        RD_Corr = f<sub>σ</sub>(RD): correlação entre os valores das {noun} nas {correlation.releases.length} releases
        de {correlation.repository.name}. Cada nome fica na diagonal: leia a linha à esquerda dele e a coluna abaixo
        dele.
      </Typography>
      <CorrelationChart option={option} entities={correlation.entities.length} />
      <Box display="flex" flexDirection="column" gap="6px">
        <ScaleLegend />
        <Typography fontSize="12px" color={DASHBOARD_COLORS.text}>
          Azul: movem-se juntas · Laranja: movem-se em sentidos opostos
        </Typography>
        <Typography fontSize="12px" fontStyle="italic" color={DASHBOARD_COLORS.mutedText}>
          {formatSignificanceNote(correlation)}
        </Typography>
        <Typography fontSize="12px" color={DASHBOARD_COLORS.text}>
          Coeficiente aplicado: {method}. Regra do modelo: Pearson se a distribuição de RD for normal, Spearman caso
          contrário.
        </Typography>
      </Box>
    </DashboardCard>
  );
}
