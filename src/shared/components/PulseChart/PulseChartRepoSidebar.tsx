import React from 'react';
import { Box, Typography } from '@mui/material';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import {
  COLOR_TOKENS,
  getQualityStatus,
  calculateVariation,
  PulseMeasurement,
  PULSE_GRID,
} from '@utils/formatPulseChart';

interface Props {
  name: string;
  measurements: PulseMeasurement[];
  topOffset: number;
  /** O que o valor é: o TSQMI no pulso do produto, a característica no do repositório. */
  valueLabel?: string;
  showIcon?: boolean;
  /**
   * Release que serve de base para a variação (pulso do produto, US06.01): com ela, a variação é do último indicador
   * em relação ao da release ("▼ 3,37% vs. Release 2"), numa linha própria. Sem ela, é em relação à medição anterior.
   */
  reference?: { name: string; value: number };
}

// "▼ 3,37%": seta, percentual sem sinal e vírgula decimal.
function formatReferenceVariation(latest: number, reference: number) {
  const percent = ((latest - reference) / reference) * 100;
  const rounded = Math.round(percent * 100) / 100;
  let symbol = '•';
  let color = COLOR_TOKENS.mutedText;
  if (rounded > 0) {
    symbol = '▲';
    color = COLOR_TOKENS.adequate;
  } else if (rounded < 0) {
    symbol = '▼';
    color = COLOR_TOKENS.critical;
  }
  const formatted = Math.abs(rounded).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return { text: `${symbol} ${formatted}%`, color };
}

export const PulseChartRepoSidebar: React.FC<Props> = ({
  name,
  measurements,
  topOffset,
  valueLabel = 'último TSQMI',
  showIcon = true,
  reference,
}) => {
  const sorted = [...measurements].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const latestMeasurement = sorted[sorted.length - 1];
  const previousMeasurement = sorted[sorted.length - 2];

  const latestVal = latestMeasurement?.value ?? 0;
  const status = getQualityStatus(latestVal);
  const variation = calculateVariation(latestVal, previousMeasurement?.value);
  const referenceVariation =
    reference && reference.value !== 0 && latestMeasurement
      ? formatReferenceVariation(latestVal, reference.value)
      : null;

  return (
    <Box
      sx={{
        position: 'absolute',
        left: 20,
        top: topOffset,
        width: 190,
        height: PULSE_GRID.height,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingRight: '12px',
        zIndex: 2,
      }}
    >
      {/* Branch icon + Repo name */}
      <Box display="flex" alignItems="center" gap={0.5} marginBottom="2px">
        {showIcon && <CallSplitIcon sx={{ fontSize: 16, color: COLOR_TOKENS.primary }} />}
        <Typography
          variant="body2"
          fontWeight="bold"
          color={COLOR_TOKENS.primary}
          sx={{
            fontSize: '12px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={name}
        >
          {name}
        </Typography>
      </Box>

      {/* TSQMI Value */}
      <Typography
        variant="h6"
        fontWeight="bold"
        sx={{
          color: status.color,
          fontSize: '22px',
          lineHeight: 1.1,
        }}
      >
        {latestVal.toFixed(3)}
      </Typography>

      {reference ? (
        <>
          {referenceVariation && (
            <Typography
              variant="caption"
              fontWeight="bold"
              sx={{ color: referenceVariation.color, fontSize: '10.5px', lineHeight: 1.4 }}
              noWrap
              title={`${referenceVariation.text} vs. ${reference.name}`}
            >
              {referenceVariation.text} vs. {reference.name}
            </Typography>
          )}
          <Typography
            variant="caption"
            color={COLOR_TOKENS.axisText}
            sx={{ fontSize: '10.5px', lineHeight: 1.4 }}
            noWrap
            title={`${valueLabel} · ${status.label.toLowerCase()}`}
          >
            {valueLabel} · {status.label.toLowerCase()}
          </Typography>
        </>
      ) : (
        // Variação em relação à medição anterior (pulso do repositório)
        <Box display="flex" alignItems="center" gap={0.5} marginTop="2px">
          {variation && (
            <Typography
              variant="caption"
              fontWeight="bold"
              sx={{
                color: variation.color,
                fontSize: '10.5px',
              }}
            >
              {variation.formattedPercentage}
            </Typography>
          )}
          <Typography
            variant="caption"
            color={COLOR_TOKENS.axisText}
            sx={{ fontSize: '10.5px' }}
          >
            {valueLabel} · {status.label}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default PulseChartRepoSidebar;
