import React from 'react';
import { useRouter } from 'next/router';

import { TableContainer, Table, TableCell, TableHead, TableRow, TableBody, IconButton, Tooltip } from '@mui/material';
import QueryStatsIcon from '@mui/icons-material/QueryStats';

import { useProductContext } from '@contexts/ProductProvider';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { IReleases } from '@customTypes/product';
import { formatDate } from '@utils/formatDate';
import { useTranslation } from 'react-i18next';

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

  const { t } = useTranslation('releases');

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('table.name')}</TableCell>
            <TableCell>{t('table.startDate')}</TableCell>
            <TableCell>{t('table.endDate')}</TableCell>
            <TableCell>{t('table.details')}</TableCell>
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
              <TableCell>
                <Tooltip title={t('table.details')}>
                  <IconButton aria-label="access-release" color="primary">
                    <QueryStatsIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ReleasesTable;
