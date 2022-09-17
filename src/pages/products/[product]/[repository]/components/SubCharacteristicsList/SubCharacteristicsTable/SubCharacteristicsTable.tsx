import React, { useState } from 'react';
import { formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { TableContainer, Table, TableCell, TableHead, TableRow, TableBody, Collapse } from '@mui/material';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';

import { useRepositoryContext } from '@contexts/RepositoryProvider';

function SubCharacteristicsTable() {
  const { historicalSQC } = useRepositoryContext();

  const [open, setOpen] = useState(false);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell align="right">Date</TableCell>
            <TableCell align="right">SQC</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {historicalSQC.history?.map((repository) => (
            <>
              <TableRow hover onClick={() => setOpen(!open)} sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                  <ArrowCircleRightIcon aria-label="expand row" />
                </TableCell>
                <TableCell align="right">
                  {formatRelative(new Date(repository.created_at), new Date(), { locale: ptBR })}
                </TableCell>
                <TableCell align="right">{repository.value.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3} align="right">
                  <Collapse in={open}>
                    {formatRelative(new Date(repository.created_at), new Date(), { locale: ptBR })}
                  </Collapse>
                </TableCell>
              </TableRow>
            </>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default SubCharacteristicsTable;
