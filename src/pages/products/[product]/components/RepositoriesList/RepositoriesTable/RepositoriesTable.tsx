import React from 'react';
import { useRouter } from 'next/router';

import { TableContainer, Table, TableCell, TableHead, TableRow, TableBody } from '@mui/material';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';

import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { useProductContext } from '@contexts/ProductProvider';

function RepositoriesTable() {
  const { currentProduct } = useProductContext();
  const { repositoryList } = useRepositoryContext();
  const router = useRouter();

  const handleClickCell = (path: string) => {
    router.push(`${currentProduct?.id}-${currentProduct?.name}/${path}`);
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {repositoryList?.map((repository) => (
            <TableRow hover onClick={() => handleClickCell(`${repository.id}-${repository.name}`)}>
              <TableCell>{repository.name}</TableCell>
              <TableCell align="right">
                <ArrowCircleRightIcon />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default RepositoriesTable;
