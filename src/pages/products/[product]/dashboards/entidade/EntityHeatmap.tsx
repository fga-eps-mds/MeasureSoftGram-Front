import React, { useEffect, useMemo, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { EntityMatrix, EntityMatrixColumn, EntityMatrixRepository } from '@customTypes/product';
import { DASHBOARD_COLORS } from '@utils/dashboardColors';
import { NO_DATA_LABEL } from '@utils/entityLevels';
import { cellId, formatDelta, formatScore, getColumnGroups, sortRepositoriesByTsqmi } from '@utils/entityMatrix';
import { getQualityBand, QUALITY_BANDS, QualityBand } from '@utils/qualityBands';

export interface SelectedCell {
  repository: { id: number; name: string };
  column: EntityMatrixColumn;
  value: number | null;
}

interface Props {
  matrix: EntityMatrix;
  highlighted: Set<string>;
  onSelectCell: (cell: SelectedCell) => void;
}

const CELL_WIDTH = 80;
const CELL_HEIGHT = 46;
const HIGHLIGHT_BORDER = '#1F2328';
const MONOSPACE = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

/** O texto escuro some no vermelho da faixa E. */
const textColor = (band: QualityBand) => (band.grade === 'E' ? '#FFFFFF' : DASHBOARD_COLORS.text);

const headerCellSx = {
  backgroundColor: '#ECEEF1',
  borderRadius: '4px',
  padding: '6px 8px',
  textAlign: 'left',
  verticalAlign: 'top',
  fontSize: '12px',
  fontWeight: 'bold',
  color: DASHBOARD_COLORS.text
} as const;

function Score({ value, detail }: { value: number | null; detail?: string }) {
  const band = value === null ? undefined : getQualityBand(value);
  if (value === null || !band) {
    return (
      <Typography fontSize="12px" fontStyle="italic" color={DASHBOARD_COLORS.mutedText}>
        {NO_DATA_LABEL}
      </Typography>
    );
  }
  return (
    <>
      <Typography fontFamily={MONOSPACE} fontWeight="bold" fontSize="15px" lineHeight={1.2} color={textColor(band)}>
        {formatScore(value)}
      </Typography>
      <Typography fontFamily={MONOSPACE} fontSize="11px" lineHeight={1.2} color={textColor(band)}>
        {detail ? `${band.grade} · ${detail}` : band.grade}
      </Typography>
    </>
  );
}

const scoreBoxSx = (value: number | null, highlighted = false) => {
  const band = value === null ? undefined : getQualityBand(value);
  return {
    width: '100%',
    height: CELL_HEIGHT,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    backgroundColor: band?.color ?? DASHBOARD_COLORS.skeleton,
    outline: highlighted ? `3px solid ${HIGHLIGHT_BORDER}` : 'none',
    outlineOffset: '-3px',
    border: 'none',
    padding: 0
  } as const;
};

function TsqmiCell({ repository }: { repository: EntityMatrixRepository }) {
  const { value, previous_value: previousValue } = repository.tsqmi;
  return (
    <Box sx={scoreBoxSx(value)} data-testid={`tsqmi-${repository.id}`}>
      <Score value={value} detail={formatDelta(value, previousValue)} />
    </Box>
  );
}

/** Legenda das 5 faixas e do destaque (CA3, CA4). */
export function QualityGradeLegend() {
  return (
    <Box display="flex" flexWrap="wrap" alignItems="center" gap="8px 16px" data-testid="quality-grade-legend">
      <Typography fontSize="12px" fontWeight="bold" color={DASHBOARD_COLORS.text}>
        Escala
      </Typography>
      {[...QUALITY_BANDS].reverse().map((band) => (
        <Box key={band.grade} display="flex" alignItems="center" gap="6px">
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: '4px',
              backgroundColor: band.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography fontSize="11px" fontWeight="bold" color={textColor(band)}>
              {band.grade}
            </Typography>
          </Box>
          <Typography fontSize="12px" color={DASHBOARD_COLORS.mutedText}>
            {band.grade === 'A'
              ? `[${formatScore(band.min)}; ${formatScore(band.max)}]`
              : `[${formatScore(band.min)}; ${formatScore(band.max)})`}{' '}
            {band.label}
          </Typography>
        </Box>
      ))}
      <Box display="flex" alignItems="center" gap="6px">
        <Box sx={{ width: 18, height: 18, borderRadius: '4px', border: `2px solid ${HIGHLIGHT_BORDER}` }} />
        <Typography fontSize="12px" color={DASHBOARD_COLORS.mutedText}>
          entre as 3 maiores contribuições para a queda
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * Mapa de calor repositório × entidade do nível (CA3): colunas agrupadas pelas entidades de cima, células com o valor,
 * o grau e a cor da faixa, linhas do pior para o melhor TSQMI. Mede o tempo entre a chegada dos dados e o desenho
 * (diretriz do épico: menos de 1 s) e o expõe em `data-render-ms`.
 */
export default function EntityHeatmap({ matrix, highlighted, onSelectCell }: Props) {
  const rows = useMemo(() => sortRepositoriesByTsqmi(matrix.repositories), [matrix]);
  const groups = useMemo(() => getColumnGroups(matrix.columns), [matrix]);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawnMatrix = useRef<EntityMatrix | null>(null);
  const drawStartedAt = useRef(0);
  if (drawnMatrix.current !== matrix) {
    drawnMatrix.current = matrix;
    drawStartedAt.current = performance.now();
  }

  useEffect(() => {
    // o desenho termina no quadro seguinte ao commit
    const frame = requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.dataset.renderMs = String(Math.round(performance.now() - drawStartedAt.current));
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [matrix]);

  // os nomes das releases ficam na descrição do quadro: aqui eles alargavam a coluna
  const tsqmiHeader = matrix.previous_release ? 'TSQMI · Δ' : 'TSQMI';

  return (
    // a rolagem horizontal fica só no quadro, para o mapa caber em telas estreitas
    <Box ref={containerRef} data-testid="entity-heatmap" sx={{ overflowX: 'auto', width: '100%' }}>
      <Box
        component="table"
        aria-label="Mapa de calor"
        sx={{ borderCollapse: 'separate', borderSpacing: '4px', minWidth: '100%' }}
      >
        <thead>
          {groups.map((row) => (
            <tr key={row.map((group) => group.key).join('/')}>
              <th aria-hidden />
              {row.map((group) => (
                <Box
                  component="th"
                  key={`${group.key}-${group.start}`}
                  colSpan={group.span}
                  scope="colgroup"
                  sx={headerCellSx}
                >
                  {group.name}
                  {group.weight !== null && (
                    <Typography component="span" fontSize="12px" color={DASHBOARD_COLORS.mutedText}>
                      {' '}
                      · {group.weight}%
                    </Typography>
                  )}
                </Box>
              ))}
              <th aria-hidden />
            </tr>
          ))}
          <tr>
            <Box component="th" scope="col" sx={{ textAlign: 'left', verticalAlign: 'bottom', fontSize: '12px' }}>
              Repositório
            </Box>
            {matrix.columns.map((column) => (
              <Box
                component="th"
                key={column.key}
                scope="col"
                sx={{ textAlign: 'left', verticalAlign: 'bottom', minWidth: CELL_WIDTH, maxWidth: CELL_WIDTH * 1.4 }}
              >
                <Typography fontSize="12px" fontWeight="bold" color={DASHBOARD_COLORS.text}>
                  {column.name}
                  {column.weight !== null && (
                    <Typography component="span" fontSize="12px" fontWeight="normal" color={DASHBOARD_COLORS.mutedText}>
                      {' '}
                      · {column.weight}%
                    </Typography>
                  )}
                </Typography>
                <Typography
                  fontSize="11px"
                  fontFamily={MONOSPACE}
                  color={DASHBOARD_COLORS.mutedText}
                  sx={{ wordBreak: 'break-all' }}
                >
                  {column.key}
                </Typography>
              </Box>
            ))}
            <Box
              component="th"
              scope="col"
              sx={{ textAlign: 'right', verticalAlign: 'bottom', fontSize: '12px', minWidth: CELL_WIDTH }}
            >
              {tsqmiHeader}
            </Box>
          </tr>
        </thead>
        <tbody>
          {rows.map((repository) => {
            const cells = new Map(repository.cells.map((cell) => [cell.key, cell]));
            return (
              <tr key={repository.id}>
                <Box
                  component="th"
                  scope="row"
                  sx={{
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    paddingRight: '12px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {repository.name}
                </Box>
                {matrix.columns.map((column) => {
                  const value = cells.get(column.key)?.value ?? null;
                  const band = value === null ? undefined : getQualityBand(value);
                  const isHighlighted = highlighted.has(cellId(repository.id, column.key));
                  return (
                    <td key={column.key}>
                      <Box
                        component="button"
                        type="button"
                        aria-label={`${repository.name} · ${column.name}: ${
                          value === null ? NO_DATA_LABEL : `${formatScore(value)} (${band?.grade}, ${band?.label})`
                        }${isHighlighted ? ', entre as maiores contribuições para a queda' : ''}`}
                        data-highlighted={isHighlighted || undefined}
                        onClick={() =>
                          onSelectCell({ repository: { id: repository.id, name: repository.name }, column, value })
                        }
                        sx={{
                          ...scoreBoxSx(value, isHighlighted),
                          cursor: 'pointer',
                          '&:hover': { filter: 'brightness(0.95)' }
                        }}
                      >
                        <Score value={value} />
                      </Box>
                    </td>
                  );
                })}
                <td>
                  <TsqmiCell repository={repository} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </Box>
    </Box>
  );
}
