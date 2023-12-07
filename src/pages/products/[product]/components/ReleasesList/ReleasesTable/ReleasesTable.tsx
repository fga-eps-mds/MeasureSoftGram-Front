import React from 'react';
import { useRouter } from 'next/router';

import { TableContainer, Table, TableCell, TableHead, TableRow, TableBody } from '@mui/material';

import { useProductContext } from '@contexts/ProductProvider';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { IReleases } from '@customTypes/product';
import { formatDate } from '@utils/formatDate';

interface ReleasesTableProps {
  releaseList: IReleases[];
}
function ReleasesTable({ releaseList }: ReleasesTableProps) {
  const { currentProduct } = useProductContext();
  const { currentOrganization } = useOrganizationContext();

  const router = useRouter();

  const handleClickCell = (path: string) => {
    void router.push(`/products/${currentOrganization?.id}-${currentProduct?.id}-${currentProduct?.name}/releases/${path}`);
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Início da release</TableCell>
            <TableCell>Fim da release</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {releaseList?.map((release) => (
            <TableRow
              key={release.id}
              hover
              onClick={() => handleClickCell(`${release?.id}`)}
              style={{ cursor: 'pointer' }}
              data-testid="repository-row"
            >
              <TableCell>{release?.release_name}</TableCell>
              <TableCell>{formatDate(release?.start_at)}</TableCell>
              <TableCell>{formatDate(release?.end_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ReleasesTable;
