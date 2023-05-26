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
import { HistoricalCharacteristicsProps, Historical, Repository } from '@customTypes/repository';
import SearchButton from '@components/SearchButton';

interface Props {
  disableButtons?: boolean;
  maxCount?: number;
}

const RepositoriesTable: React.FC<Props> = ({ disableButtons, maxCount }: Props) => {
  const { currentProduct } = useProductContext();
  const { currentOrganization } = useOrganizationContext();
  const { repositoryList } = useRepositoryContext();
  const router = useRouter();

  const [open, setOpen] = useState({});
  const [filteredRepositories, setFilteredRepositories] = useState<Repository[]>([]);

  const handleClickRedirects = (id: string) => {
    const path = `/products/${currentOrganization?.id}-${currentProduct?.id}-${currentProduct?.name}/repositories/${id}`;
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

  const handleRepositoriesFilter = (name: string) => {
    if ((name == null || name === '') && repositoryList?.length) {
      setFilteredRepositories(maxCount ? repositoryList.slice(0, maxCount) : repositoryList);
      return;
    }
    const repositoriesWithName =
      repositoryList?.filter((currentRepository: Repository) =>
        currentRepository.name.toLowerCase().includes(name.toLowerCase())
      ) ?? [];

    setFilteredRepositories(maxCount ? repositoriesWithName.slice(0, maxCount) : repositoriesWithName);
  };

  // update historicalCharacteristics if repositoryList changes
  useEffect(() => {
    if (repositoryList?.length) {
      loaldHistoricalCharacteristics(repositoryList[0].id);
      setFilteredRepositories(maxCount ? repositoryList.slice(0, maxCount) : repositoryList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repositoryList]);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={{paddingBottom: '35px'}}>Nome</TableCell>
            <TableCell align="right" style={{paddingBottom: '35px'}}>
              <SearchButton
                onInput={(e) => handleRepositoriesFilter(e.target.value)}
                label="Insira o nome do repositório"
              />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredRepositories?.map((repo) => (
            <React.Fragment key={repo.id}>
              <TableRow hover style={{ cursor: 'pointer' }} data-testid="repository-row">
                <TableCell onClick={() => handleClickRedirects(`${repo.id}-${repo.name}`)}>{repo.name}</TableCell>
                {disableButtons ? (
                  <TableCell />
                ) : (
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
                )}
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
};

export default RepositoriesTable;
