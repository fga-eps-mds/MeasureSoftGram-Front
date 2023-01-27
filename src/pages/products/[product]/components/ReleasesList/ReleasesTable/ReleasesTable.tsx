import React from 'react';
import { useRouter } from 'next/router';

import { TableContainer, Table, TableCell, TableHead, TableRow, TableBody } from '@mui/material';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';

import { useProductContext } from '@contexts/ProductProvider';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { CompareGoalAccomplished } from '@customTypes/product';
import { formatDate } from '@utils/formatDate';

interface ReleasesTableProps {
  releaseList: CompareGoalAccomplished[];
}
function ReleasesTable({ releaseList }: ReleasesTableProps) {
  const { currentProduct } = useProductContext();
  const { currentOrganization } = useOrganizationContext();

  const router = useRouter();

  const handleClickCell = (path: string) => {
    router.push(`${currentOrganization?.id}-${currentProduct?.id}-${currentProduct?.name}/${path}`);
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Início da release</TableCell>
            <TableCell>Fim da release</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {releaseList?.map((release) => (
            <TableRow
              key={release.id}
              hover
              onClick={() => handleClickCell(`release/${release?.id}`)}
              style={{ cursor: 'pointer' }}
              data-testid="repository-row"
            >
              <TableCell>{release?.release_name}</TableCell>
              <TableCell>{formatDate(release?.start_at)}</TableCell>
              <TableCell>{formatDate(release?.end_at)}</TableCell>
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

export default ReleasesTable;
