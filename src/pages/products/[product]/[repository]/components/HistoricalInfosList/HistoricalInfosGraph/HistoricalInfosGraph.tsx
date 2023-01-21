import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { TableCell, TableRow, Collapse } from '@mui/material';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';

import GraphicStackedLine from '@components/GraphicStackedLine';
import { Historical, SqcHistory } from '@customTypes/repository';

interface OptionCheckedProps {
  [key: string]: boolean;
}

interface Props {
  SQC: SqcHistory;
  checkedOptions: OptionCheckedProps;
  subCharacteristics: Historical[];
  measures: Historical[];
  metrics: Historical[];
}

function HistoricalInfosGraph({ SQC, checkedOptions, subCharacteristics, measures, metrics }: Props) {
  const [open, setOpen] = useState(false);
  const { value, created_at: createdAt } = SQC;

  return (
    <>
      <TableRow hover onClick={() => setOpen(!open)} sx={{ '& > *': { borderBottom: 'unset' } }} data-testid="open-row">
        <TableCell>
          {open ? <ArrowCircleDownIcon aria-label="expand row" data-testid="open"/> : <ArrowCircleRightIcon aria-label="expand row" />}
        </TableCell>
        <TableCell align="right">{format(new Date(createdAt), 'dd/MM/yyyy HH:MM', { locale: ptBR })}</TableCell>
        <TableCell align="right">{value.toFixed(2)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3} align="right">
          <Collapse in={open}>
            <GraphicStackedLine
              historical={subCharacteristics}
              checkedOptions={checkedOptions}
              title="Sub-Caracteríticas"
              selected={(item: Date) => createdAt === item}
            />
            <GraphicStackedLine
              historical={measures}
              checkedOptions={checkedOptions}
              title="Medidas"
              selected={(item: Date) => createdAt === item}
            />

            <GraphicStackedLine
              historical={metrics}
              checkedOptions={checkedOptions}
              title="Métricas"
              selected={(item: Date) => createdAt === item}
            />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default HistoricalInfosGraph;
