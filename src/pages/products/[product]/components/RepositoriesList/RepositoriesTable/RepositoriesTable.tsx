import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

import {
  TableContainer,
  Table,
  TableCell,
  TableHead,
  TableRow,
  TableBody,
  Collapse,
  Box,
  Typography
} from '@mui/material';
import { ArrowCircleRight, AddCircle, RemoveCircle } from '@mui/icons-material';

import { repository } from '@services/repository';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import MeasureSoftGramChart from '@components/MeasureSoftGramChart';
import { HistoricalCharacteristicsProps, Historical } from '@customTypes/repository';

function RepositoriesTable() {
  const { currentProduct } = useProductContext();
  const { currentOrganization } = useOrganizationContext();
  const { repositoryList } = useRepositoryContext();
  const router = useRouter();

  const [open, setOpen] = useState({});

  const handleClickRedirects = (id: string) => {
    const path = `${currentOrganization?.id}-${currentProduct?.id}-${currentProduct?.name}/${id}`;
    router.push(path);
  };

  const [historicalCharacteristics, setHistoricalCharacteristics] = useState<Historical[]>([]);

  const handleClickExpand = (id: string) => {
    loaldHistoricalCharacteristics(id);
    setOpen((prevState) => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };

  const handleClickCollapse = (id: string) => {
    setOpen((prevState) => ({
      ...prevState,
      [id]: false
    }));
  };

  const loaldHistoricalCharacteristics = async (id: string) => {
    try {
      const organizationId = currentOrganization?.id;
      const productId = currentProduct?.id;
      const entity = 'characteristics';
      const repositoryId = id;

      const props: HistoricalCharacteristicsProps = {
        organizationId,
        productId,
        repositoryId,
        entity
      };

      const response = await repository.getHistorical(props);

      if (response?.data?.length) {
        return {
          setHistoricalCharacteristics: {}
        };
      }
      setHistoricalCharacteristics(response?.data.results);
    } catch (err) {
      toast.error(err);
    }
  };

  // update historicalCharacteristics if repositoryList changes
  useEffect(() => {
    if (repositoryList?.length) {
      loaldHistoricalCharacteristics(repositoryList[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repositoryList]);

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
          {repositoryList?.map((repo) => (
            <React.Fragment key={repo.id}>
              <TableRow hover style={{ cursor: 'pointer' }} data-testid="repository-row">
                <TableCell>{repo.name}</TableCell>
                <TableCell align="right">
                  <ArrowCircleRight
                    aria-label="expand row"
                    onClick={() => handleClickRedirects(`${repo.id}-${repo.name}`)}
                  />
                  {open[repo.id] ? (
                    <RemoveCircle aria-label="collapse row" onClick={() => handleClickCollapse(repo.id)} />
                  ) : (
                    <AddCircle aria-label="expand row" onClick={() => handleClickExpand(repo.id)} />
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                  <Collapse in={open[repo.id]} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 1 }}>
                      {historicalCharacteristics?.length === 0 ? (
                        <Typography>Não é possível visualizar o gráfico, pois não há dados.</Typography>
                      ) : (
                        <MeasureSoftGramChart historical={historicalCharacteristics} repositoryName={repo.name} />
                      )}
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default RepositoriesTable;
