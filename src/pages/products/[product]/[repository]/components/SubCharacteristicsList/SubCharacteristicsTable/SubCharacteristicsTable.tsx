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

import SubCharacteristicsGraph from '../SubCharacteristicsGraph';
import { useQuery } from '../hooks/useQuery';

interface OptionCheckedProps {
  [key: string]: boolean;
}

interface Prop {
  checkedOptions: OptionCheckedProps;
}

function SubCharacteristicsTable({ checkedOptions }: Prop) {
  const { repositoryHistoricalSubCharacteristics } = useQuery();

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
              <SubCharacteristicsGraph
                SQC={SQC}
                checkedOptions={checkedOptions}
                subCharacteristics={repositoryHistoricalSubCharacteristics}
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

export default SubCharacteristicsTable;
