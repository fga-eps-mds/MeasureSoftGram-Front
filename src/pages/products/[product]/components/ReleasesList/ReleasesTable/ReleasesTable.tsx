import React from 'react';
import { useRouter } from 'next/router';

import { TableContainer, Table, TableCell, TableHead, TableRow, TableBody } from '@mui/material';
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight';

import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { useOrganizationContext } from '@contexts/OrganizationProvider';

function ReleasesTable() {
  const { currentProduct } = useProductContext();
  const { currentOrganization } = useOrganizationContext();

  const { data, fetchMore, mutate, isReachingEnd } = useRequestInfinite<PaginatedResult<PostoOData[]>>(
    (_, previousPageData) =>
      searchAsset({
        assetType: 'acionamentoPostoO',
        limit: 10,
        bookmark: previousPageData?.data?.metadata?.bookmark || '',
        filters: {
          ...(contratoSearched !== 'all' && {
            contrato: {
              '@key': contratoSearched
            }
          })
        }
      }),
    { dataPath: 'result', limit: 10 }
  );

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
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {repositoryList?.map((repository) => (
            <TableRow
              key={repository.id}
              hover
              onClick={() => handleClickCell(`${repository.id}-${repository.name}`)}
              style={{ cursor: 'pointer' }}
              data-testid="repository-row"
            >
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

export default ReleasesTable;
