import React, { useState } from 'react';

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
}

function SubCharacteristicsGraph({ SQC, checkedOptions, subCharacteristics }: Props) {
  const [open, setOpen] = useState(false);
  const { value, created_at: createdAt } = SQC;

  return (
    <div data-testid="sub-characteristics-graph">
      <TableRow data-testid="open-row" hover onClick={() => setOpen(!open)} sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell data-testid="open">
          {open ? <ArrowCircleDownIcon aria-label="expand row" /> : <ArrowCircleRightIcon aria-label="expand row" />}
        </TableCell>
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
          </Collapse>
        </TableCell>
      </TableRow>
    </div>
  );
}

export default SubCharacteristicsGraph;
