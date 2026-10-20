import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { EntityAnalysis, EntityAnalysisRepository, EntityLevel } from '@customTypes/product';
import { formatEntityValue, LEVEL_LABELS } from '@utils/formatEntityAnalysisChart';

const CHILD_LEVEL: Partial<Record<EntityLevel, EntityLevel>> = {
  characteristic: 'subcharacteristic',
  subcharacteristic: 'measure',
  measure: 'metric',
};

interface Props {
  analysis: EntityAnalysis;
  repository: EntityAnalysisRepository | null;
  onClose: () => void;
}

export default function RepositoryDetailDialog({ analysis, repository, onClose }: Props) {
  const childLevel = CHILD_LEVEL[analysis.level];

  return (
    <Dialog open={!!repository} onClose={onClose} fullWidth maxWidth="sm">
      {repository && (
        <>
          <DialogTitle>
            {analysis.entity.name} em {repository.name}
            <Typography variant="body2" color="text.secondary">
              Valor: {formatEntityValue(repository.value, analysis.level, analysis.entity.metric_type)}
            </Typography>
          </DialogTitle>
          <DialogContent dividers>
            {!childLevel || repository.children.length === 0 ? (
              <Typography color="text.secondary">
                {childLevel ? 'Esta entidade não tem filhos na configuração da release.' : 'Métricas não têm filhos no modelo.'}
              </Typography>
            ) : (
              <Table size="small" aria-label={`Filhos de ${analysis.entity.name}`}>
                <TableHead>
                  <TableRow>
                    <TableCell>{LEVEL_LABELS[childLevel]}</TableCell>
                    <TableCell align="right">Peso</TableCell>
                    <TableCell align="right">Valor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {repository.children.map((child) => (
                    <TableRow key={child.key}>
                      <TableCell>{child.name}</TableCell>
                      <TableCell align="right">{child.weight === null ? '—' : `${child.weight}%`}</TableCell>
                      <TableCell
                        align="right"
                        sx={child.value === null ? { color: 'text.secondary', fontStyle: 'italic' } : undefined}
                      >
                        {formatEntityValue(child.value, childLevel)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Fechar</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
