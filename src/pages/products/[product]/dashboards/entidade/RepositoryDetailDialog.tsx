import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { EntityAnalysis, EntityLevel, EntityMatrixLevel } from '@customTypes/product';
import { useRequest } from '@hooks/useRequest';
import { productQuery } from '@services/product';
import { formatEntityValue, LEVEL_LABELS, NO_DATA_LABEL } from '@utils/entityLevels';
import { formatScore } from '@utils/entityMatrix';
import { getQualityBand } from '@utils/qualityBands';
import { SelectedCell } from './EntityHeatmap';

const CHILD_LEVEL: Record<EntityMatrixLevel, EntityLevel> = {
  characteristic: 'subcharacteristic',
  subcharacteristic: 'measure',
  measure: 'metric'
};

interface Props {
  organizationId: string;
  productId: string;
  releaseId?: number;
  level: EntityMatrixLevel;
  cell: SelectedCell | null;
  onClose: () => void;
}

function formatCellValue(value: number | null): string {
  if (value === null) return NO_DATA_LABEL;
  const band = getQualityBand(value);
  return band ? `${formatScore(value)} (${band.grade}, ${band.label})` : formatScore(value);
}

/** Composição da célula (CA7): os filhos da entidade naquele repositório, com o peso e o valor de cada um. */
export default function RepositoryDetailDialog({ organizationId, productId, releaseId, level, cell, onClose }: Props) {
  const childLevel = CHILD_LEVEL[level];
  const {
    data: analysis,
    error,
    isLoading,
    mutate
  } = useRequest<EntityAnalysis>(
    cell ? productQuery.getEntityAnalysis(organizationId, productId, { releaseId, level, key: cell.column.key }) : null
  );
  const children = analysis?.repositories.find((repository) => repository.id === cell?.repository.id)?.children;

  const renderContent = () => {
    if (error) {
      return (
        <Box display="flex" alignItems="center" gap={2}>
          <Typography color="text.secondary">Não foi possível carregar a composição.</Typography>
          <Button size="small" onClick={() => void mutate()}>
            Tentar novamente
          </Button>
        </Box>
      );
    }
    if (isLoading || !analysis) {
      return (
        <Box display="flex" justifyContent="center" padding={2}>
          <CircularProgress size={28} />
        </Box>
      );
    }
    if (!children || children.length === 0) {
      return <Typography color="text.secondary">Esta entidade não tem filhos na configuração da release.</Typography>;
    }
    return (
      <Table size="small" aria-label={`Filhos de ${cell?.column.name}`}>
        <TableHead>
          <TableRow>
            <TableCell>{LEVEL_LABELS[childLevel]}</TableCell>
            <TableCell align="right">Peso</TableCell>
            <TableCell align="right">Valor</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {children.map((child) => (
            <TableRow key={child.key}>
              <TableCell>{child.name}</TableCell>
              <TableCell align="right">{child.weight === null ? '—' : `${child.weight}%`}</TableCell>
              <TableCell
                align="right"
                sx={child.value === null ? { color: 'text.secondary', fontStyle: 'italic' } : undefined}
              >
                {childLevel === 'metric' ? formatEntityValue(child.value, childLevel) : formatCellValue(child.value)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <Dialog open={!!cell} onClose={onClose} fullWidth maxWidth="sm">
      {cell && (
        <>
          <DialogTitle>
            {cell.column.name} em {cell.repository.name}
            <Typography variant="body2" color="text.secondary">
              Valor: {formatCellValue(cell.value)}
            </Typography>
          </DialogTitle>
          <DialogContent dividers>{renderContent()}</DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Fechar</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
