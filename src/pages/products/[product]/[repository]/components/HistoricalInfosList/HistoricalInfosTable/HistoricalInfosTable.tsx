import React, { useState } from 'react';

import {
  TableContainer,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  TableFooter,
  TablePagination
} from '@mui/material';

import { useRepositoryContext } from '@contexts/RepositoryProvider';

import HistoricalInfosGraph from '../HistoricalInfosGraph';
import { useQuery } from '../hooks/useQuery';

interface OptionCheckedProps {
  [key: string]: boolean;
}

interface Prop {
  checkedOptions: OptionCheckedProps;
}

function HistoricalInfosTable({ checkedOptions }: Prop) {
  const { repositoryHistoricalSubCharacteristics, repositoryHistoricalMeasures, repositoryHistoricalMetrics } = useQuery();

  const {
    historicalSQC: { history }
  } = useRepositoryContext();
  const [page, setPage] = useState(0);

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

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
          {[...history]
            .reverse()
            .slice(page * 5, page * 5 + 5)
            ?.map((SQC) => (
              <HistoricalInfosGraph
                SQC={SQC}
                checkedOptions={checkedOptions}
                subCharacteristics={repositoryHistoricalSubCharacteristics}
                measures={repositoryHistoricalMeasures}
                metrics={repositoryHistoricalMetrics}
                key={SQC.id}
              />
            ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              count={history.length}
              rowsPerPage={5}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPageOptions={[5]}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}

export default HistoricalInfosTable;
