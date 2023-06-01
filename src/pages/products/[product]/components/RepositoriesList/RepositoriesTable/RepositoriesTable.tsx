import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import { TableContainer, Table, TableCell, TableHead, TableRow, TableBody } from '@mui/material';

import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { Repository } from '@customTypes/repository';
import SearchButton from '@components/SearchButton';

interface Props {
  maxCount?: number;
}

const RepositoriesTable: React.FC<Props> = ({ maxCount }: Props) => {
  const { currentProduct } = useProductContext();
  const { currentOrganization } = useOrganizationContext();
  const { repositoryList } = useRepositoryContext();
  const router = useRouter();

  const [filteredRepositories, setFilteredRepositories] = useState<Repository[]>([]);

  const handleClickRedirects = (id: string) => {
    const path = `/products/${currentOrganization?.id}-${currentProduct?.id}-${currentProduct?.name}/repositories/${id}`;
    router.push(path);
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
      setFilteredRepositories((prevState) => {
        const tempRepositoryList = maxCount != null ? [...repositoryList.splice(0, maxCount)] : [...repositoryList];
        const prevString = JSON.stringify(prevState);
        const currentString = JSON.stringify(tempRepositoryList);

        if (prevString !== currentString) {
          return tempRepositoryList;
        }

        return prevState;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repositoryList]);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={{ paddingBottom: '35px' }}>Nome</TableCell>
            <TableCell align="right" style={{ paddingBottom: '35px' }}>
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
                <TableCell colSpan={2} onClick={() => handleClickRedirects(`${repo.id}-${repo.name}`)}>
                  {repo.name}
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
