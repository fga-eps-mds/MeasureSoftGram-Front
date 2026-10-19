import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useTranslation } from 'react-i18next';
import { Characteristic } from '@customTypes/product';
import { StyledSlider } from '@components/Equalizer/EqualizerSlider/styles';
import {
  CharacteristicComparison,
  ComparisonStatus,
  comparePlannedAccomplished,
  formatComparisonValue,
} from '@utils/comparePlannedAccomplished';

export interface PlannedVsAccomplishedEqualizerProps {
  planned: Characteristic[];
  /** Características realizadas do repositório; `undefined` quando a release ainda não tem análise. */
  accomplished?: Characteristic[];
  normDiff?: number | null;
}

/** Mesmas cores do gráfico de linhas Planejado vs Realizado (painel do Grafana). */
export const COLORS = {
  planned: '#1F60C4',
  accomplished: '#FF8C00',
  primary: '#2B4D6F',
};

const STATUS_COLOR: Record<ComparisonStatus, string> = {
  equal: '#2B4D6F',
  above: '#2E7D32',
  below: '#C62828',
  'no-data': '#6B7280',
};

export const STATUS_SYMBOL: Record<ComparisonStatus, string> = {
  equal: '=',
  above: '▲',
  below: '▼',
  'no-data': '—',
};

/**
 * Todos os trilhos ficam numa única linha, para as curvas serem contínuas (como no protótipo).
 * Em telas estreitas o equalizador ganha rolagem horizontal própria, sem alargar a página.
 */
const MIN_COLUMN_WIDTH = 96;

export interface TrackGeometry {
  x: number;
  top: number;
  height: number;
}

interface CurvePoint {
  x: number;
  y: number;
}

const toPoint = (value: number, track: TrackGeometry): CurvePoint => ({
  x: track.x,
  y: track.top + (1 - Math.min(1, Math.max(0, value))) * track.height,
});

/** Agrupa os pontos em trechos contínuos: quebra onde não há valor e na mudança de linha do grid. */
export function splitCurveRuns(values: (number | null)[], tracks: TrackGeometry[]): CurvePoint[][] {
  const runs: CurvePoint[][] = [];
  let current: CurvePoint[] = [];
  let previousTop: number | null = null;

  values.forEach((value, index) => {
    const track = tracks[index];
    const sameRow = previousTop !== null && track && Math.abs(previousTop - track.top) < 1;
    if (value === null || !track || track.height <= 0 || !sameRow) {
      if (current.length) runs.push(current);
      current = [];
    }
    if (value !== null && track && track.height > 0) {
      current.push(toPoint(value, track));
      previousTop = track.top;
    } else {
      previousTop = null;
    }
  });
  if (current.length) runs.push(current);

  return runs;
}

const fmt = (n: number) => n.toFixed(1);

/**
 * Curva suave como no protótipo: em cada trilho a tangente é horizontal e entre dois trilhos
 * a linha faz um "S" (Bézier cúbica com os pontos de controle na metade do caminho).
 * Assim a curva nunca passa acima de 1 nem abaixo de 0. Um valor isolado (vizinhos sem dado)
 * vira um traço horizontal curto, para continuar visível.
 */
const ISOLATED_STROKE_HALF_WIDTH = 12;

export function buildCurvePath(values: (number | null)[], tracks: TrackGeometry[]): string {
  return splitCurveRuns(values, tracks)
    .map((points) => {
      if (points.length === 1) {
        const [{ x, y }] = points;
        return `M${fmt(x - ISOLATED_STROKE_HALF_WIDTH)} ${fmt(y)} L${fmt(x + ISOLATED_STROKE_HALF_WIDTH)} ${fmt(y)}`;
      }
      let path = `M${fmt(points[0].x)} ${fmt(points[0].y)}`;
      for (let i = 0; i < points.length - 1; i += 1) {
        const from = points[i];
        const to = points[i + 1];
        const midX = (from.x + to.x) / 2;
        path += ` C${fmt(midX)} ${fmt(from.y)} ${fmt(midX)} ${fmt(to.y)} ${fmt(to.x)} ${fmt(to.y)}`;
      }
      return path;
    })
    .join(' ');
}

function LegendItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <svg width={28} height={14} aria-hidden="true">
        {children}
      </svg>
      <Typography fontSize="13px" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

export default function PlannedVsAccomplishedEqualizer({
  planned,
  accomplished,
  normDiff,
}: PlannedVsAccomplishedEqualizerProps) {
  const { t } = useTranslation('release');

  const comparisons = useMemo(() => comparePlannedAccomplished(planned, accomplished), [planned, accomplished]);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const sliderRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [tracks, setTracks] = useState<TrackGeometry[]>([]);

  /** Mede a posição real dos trilhos, para as curvas acompanharem o grid responsivo. */
  const measureTracks = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();

    setTracks(
      sliderRefs.current.slice(0, comparisons.length).map((slider) => {
        if (!slider) return { x: 0, top: 0, height: 0 };
        const rect = slider.getBoundingClientRect();
        return {
          x: rect.left - containerRect.left + rect.width / 2,
          top: rect.top - containerRect.top,
          height: rect.height,
        };
      }),
    );
  }, [comparisons.length]);

  useEffect(() => {
    measureTracks();
    if (typeof ResizeObserver === 'undefined' || !containerRef.current) return undefined;

    const observer = new ResizeObserver(() => measureTracks());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [measureTracks]);

  if (planned.length === 0) {
    return (
      <Alert severity="info" data-testid="equalizer-no-planning">
        {t('equalizer.noPlanning')}
      </Alert>
    );
  }

  const hasAccomplished = accomplished !== undefined;

  const statusLabel = (status: ComparisonStatus) => t(`equalizer.status.${status}`);
  const characteristicLabel = (key: string) => t(`characteristics.${key}`);

  const renderTooltip = (item: CharacteristicComparison) => (
    <Box data-testid={`equalizer-tooltip-${item.key}`}>
      <Typography fontSize="13px" fontWeight={600}>
        {characteristicLabel(item.key)}
      </Typography>
      <Typography fontSize="12px">
        {t('planned')} (Rp): {formatComparisonValue(item.rp)}
      </Typography>
      <Typography fontSize="12px">
        {t('accomplised')} (Rd): {formatComparisonValue(item.rd, t('equalizer.noData'))}
      </Typography>
      <Typography fontSize="12px">
        {t('diff')} (Rp − Rd): {formatComparisonValue(item.delta)}
      </Typography>
      <Typography fontSize="12px">
        {t('equalizer.situation')}: {STATUS_SYMBOL[item.status]} {statusLabel(item.status)}
      </Typography>
    </Box>
  );

  const renderLegend = () => (
    <Stack
      direction="row"
      flexWrap="wrap"
      justifyContent="center"
      sx={{ columnGap: 3, rowGap: 1, mb: 4 }}
      data-testid="equalizer-legend"
    >
      <LegendItem label={t('equalizer.legend.planned')}>
        <line x1={1} y1={7} x2={27} y2={7} stroke={COLORS.planned} strokeWidth={3} strokeLinecap="round" />
      </LegendItem>
      {hasAccomplished && (
        <LegendItem label={t('equalizer.legend.accomplished')}>
          <line x1={1} y1={7} x2={27} y2={7} stroke={COLORS.accomplished} strokeWidth={3} strokeLinecap="round" />
        </LegendItem>
      )}
      <LegendItem label={t('equalizer.legend.cursor')}>
        <rect x={5} y={2} width={18} height={10} rx={4} fill="#fff" stroke={COLORS.primary} strokeWidth={2} />
      </LegendItem>
    </Stack>
  );

  const svgStyle = (zIndex: number): React.CSSProperties => ({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    overflow: 'visible',
    zIndex,
  });

  /** Rp fica atrás dos trilhos, para o cursor (que marca o próprio Rp) aparecer por cima da linha. */
  const renderPlannedCurve = () => (
    <svg style={svgStyle(0)} aria-hidden="true" data-testid="equalizer-curves">
      <path
        d={buildCurvePath(comparisons.map((item) => item.rp), tracks)}
        fill="none"
        stroke={COLORS.planned}
        strokeWidth={3}
        strokeLinejoin="round"
        strokeLinecap="round"
        data-testid="equalizer-curve-planned"
      />
    </svg>
  );

  /** Rd fica na frente de tudo, para não ser cortado ao cruzar os trilhos. */
  const renderAccomplishedCurve = () => (
    <svg style={svgStyle(2)} aria-hidden="true">
      <path
        d={buildCurvePath(comparisons.map((item) => item.rd), tracks)}
        fill="none"
        stroke={COLORS.accomplished}
        strokeWidth={3}
        strokeLinejoin="round"
        strokeLinecap="round"
        data-testid="equalizer-curve-accomplished"
      />
    </svg>
  );

  const renderTracks = () => (
    <Box position="relative" ref={containerRef} minWidth={comparisons.length * MIN_COLUMN_WIDTH}>
      {renderPlannedCurve()}
      <Box
        display="grid"
        gridTemplateColumns={`repeat(${comparisons.length}, minmax(0, 1fr))`}
        gap={{ xs: 1, sm: 3, md: 6 }}
        justifyItems="center"
        alignItems="start"
        position="relative"
        zIndex={1}
      >
        {comparisons.map((item, index) => (
          <Tooltip key={`track-${item.key}`} title={renderTooltip(item)} arrow placement="top">
            <Grid
              container
              direction="column"
              gap={2}
              tabIndex={0}
              aria-label={`${characteristicLabel(item.key)}: ${t('planned')} ${formatComparisonValue(item.rp)}, ${t(
                'accomplised',
              )} ${formatComparisonValue(item.rd, t('equalizer.noData'))}, ${statusLabel(item.status)}`}
              data-testid={`equalizer-track-${item.key}`}
              sx={{
                width: '100%',
                maxWidth: '120px',
                outline: 'none',
                borderRadius: 2,
                '&:focus-visible': { boxShadow: `0 0 0 2px ${COLORS.primary}` },
              }}
            >
              <Grid item display="flex" justifyContent="center">
                <StyledSlider
                  ref={(element: HTMLSpanElement | null) => {
                    sliderRefs.current[index] = element;
                  }}
                  aria-label={characteristicLabel(item.key)}
                  orientation="vertical"
                  value={item.rp}
                  min={0}
                  max={1}
                  step={0.01}
                  valueLabelDisplay="off"
                  tabIndex={-1}
                  data-testid={`equalizer-slider-${item.key}`}
                  sx={{
                    minHeight: '15rem',
                    pointerEvents: 'none',
                    // mesma espessura que o equalizador renderiza na tela de planejamento (trilho de 4px);
                    // '&&' aumenta a especificidade para não depender da ordem do CSS do styled-components
                    '&&': { width: 4 },
                    '&& .MuiSlider-rail, && .MuiSlider-track': { width: 4 },
                  }}
                />
              </Grid>
              <Grid item display="flex" alignItems="center" justifyContent="center">
                <Typography fontSize={{ xs: '12px', md: '14px' }} align="center">
                  {characteristicLabel(item.key)}
                </Typography>
              </Grid>
            </Grid>
          </Tooltip>
        ))}
      </Box>
      {hasAccomplished && renderAccomplishedCurve()}
    </Box>
  );

  const cellSx = { fontSize: '13px', whiteSpace: 'nowrap' as const, px: 1.5 };

  const renderRow = (label: string, testId: string, renderCell: (item: CharacteristicComparison) => React.ReactNode) => (
    <TableRow data-testid={testId}>
      <TableCell component="th" scope="row" sx={{ ...cellSx, fontWeight: 600, color: COLORS.primary }}>
        {label}
      </TableCell>
      {comparisons.map((item) => (
        <TableCell key={`${testId}-${item.key}`} align="center" sx={cellSx}>
          {renderCell(item)}
        </TableCell>
      ))}
    </TableRow>
  );

  const renderVectors = () => (
    <TableContainer sx={{ mt: 5, overflowX: 'auto', contain: 'inline-size' }} data-testid="equalizer-vectors">
      <Table size="small" aria-label={t('view-values')}>
        <TableHead>
          <TableRow>
            <TableCell sx={cellSx} />
            {comparisons.map((item) => (
              <TableCell key={`head-${item.key}`} align="center" sx={{ ...cellSx, whiteSpace: 'normal', fontWeight: 600 }}>
                {characteristicLabel(item.key)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {renderRow('Rp', 'vector-rp', (item) => formatComparisonValue(item.rp))}
          {renderRow('Rd', 'vector-rd', (item) => formatComparisonValue(item.rd, t('equalizer.noData')))}
          {renderRow('Rc = max(0, Rp − Rd)', 'vector-rc', (item) => formatComparisonValue(item.rc))}
          {renderRow('Rp − Rd', 'vector-delta', (item) => formatComparisonValue(item.delta))}
          {hasAccomplished &&
            renderRow(t('equalizer.situation'), 'vector-status', (item) => (
              <Typography component="span" fontSize="13px" fontWeight={500} color={STATUS_COLOR[item.status]}>
                {`${STATUS_SYMBOL[item.status]} ${statusLabel(item.status)}`}
              </Typography>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderNormDiff = () =>
    typeof normDiff === 'number' && Number.isFinite(normDiff) ? (
      <Stack direction="row" alignItems="center" gap={1} mt={2} data-testid="equalizer-norm-diff">
        <Typography fontSize="13px" fontWeight={600} color={COLORS.primary}>
          {t('norm-diff.title')}: {normDiff.toFixed(2)}
        </Typography>
        <Tooltip title={t('norm-diff.tooltip')}>
          <InfoOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        </Tooltip>
      </Stack>
    ) : null;

  return (
    <Box data-testid="planned-vs-accomplished-equalizer" width="100%" minWidth={0}>
      {!hasAccomplished && (
        <Alert severity="info" sx={{ mb: 3 }} data-testid="equalizer-no-accomplished">
          {t('equalizer.noAccomplished')}
        </Alert>
      )}
      <Box sx={{ border: 1, borderRadius: 3, px: { xs: 2, sm: 3 }, py: { xs: 4, sm: 6 }, width: '100%' }}>
        {renderLegend()}
        <Box sx={{ overflowX: 'auto', contain: 'inline-size', pt: 1, pb: 1 }}>{renderTracks()}</Box>
        {renderVectors()}
        {renderNormDiff()}
      </Box>
    </Box>
  );
}
