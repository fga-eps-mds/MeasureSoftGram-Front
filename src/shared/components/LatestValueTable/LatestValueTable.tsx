import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Box,
  TableContainer,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  Paper,
  Alert,
  Fade,
  Skeleton
} from '@mui/material';

import _ from 'lodash';
import { useRequestValues } from '@hooks/useRequestValues';

interface Prop {
  title: string;
  value: 'characteristics' | 'subcharacteristics' | 'measures' | 'metrics';
}

function LatestValueTable({ title, value }: Prop) {
  const { data, error, isLoading, isEmpty } = useRequestValues({ type: 'latest-values', value });
  const tableRows: { name: string; latestValue: number; latestData: string }[] = [];

  _.forEach(data, (item) => {
    const { name } = item;
    const { value: latestValue, created_at: latestData } = item.latest;

    tableRows.push({
      name,
      latestValue,
      latestData: format(new Date(latestData), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })
    });
  });

  return isLoading ? (
    <Skeleton sx={{ width: '100%', minWidth: 400, height: '215px', marginTop: '12px' }} />
  ) : (
    <Box marginTop="12px">
      <Fade in timeout={1000}>
        <TableContainer component={Paper} sx={{ minWidth: 350, maxHeight: '215px' }}>
          <Table stickyHeader aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>{title}</TableCell>
                <TableCell align="right">Último valor</TableCell>
                <TableCell align="right">Última medição</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableRows.map((row) => (
                <TableRow key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell align="right">{row.latestValue.toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ width: '250px' }}>
                    {row.latestData}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Fade>
      {error && (
        <Fade in>
          <Alert variant="standard" severity="error">
            Ocorreu um erro ao tentar carregar as informações
          </Alert>
        </Fade>
      )}
      {isEmpty && (
        <Fade in>
          <Alert variant="standard" severity="warning">
            Não há dados para serem exibidos
          </Alert>
        </Fade>
      )}
    </Box>
  );
}

export default LatestValueTable;
