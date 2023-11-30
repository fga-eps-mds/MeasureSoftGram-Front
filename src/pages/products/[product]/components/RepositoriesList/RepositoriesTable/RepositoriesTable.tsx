import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

import { TableContainer, Table, TableCell, TableHead, TableRow, TableBody, IconButton } from '@mui/material';

import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { Repository } from '@customTypes/repository';
import SearchButton from '@components/SearchButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery } from '../../../repositories/hooks/useQuery';
import ConfirmationModal from '@components/ConfirmationModal';

interface Props {
  maxCount?: number;
}

const RepositoriesTable: React.FC<Props> = ({ maxCount }: Props) => {
  const { currentProduct } = useProductContext();
  const { currentOrganization } = useOrganizationContext();
  const { repositoryList, setRepositoryList } = useRepositoryContext();
  const router = useRouter();
  const { handleRepositoryAction } = useQuery();

  const [filteredRepositories, setFilteredRepositories] = useState<Repository[]>([]);
  const [repositoryToDelete, setRepositoryToDelete] = useState<Repository | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleClickRedirects = (id: string) => {
    const path = `/products/${currentOrganization?.id}-${currentProduct?.id}-${currentProduct?.name}/repositories/${id}`;
    void router.push(path);
  };

  function handleRepositoriesFilter(name: string) {
    if ((name == null || name === '') && repositoryList?.length) {
      setFilteredRepositories([...repositoryList]);
      return;
    }
    const repositoriesWithName =
      repositoryList?.filter((currentRepository: Repository) =>
        currentRepository.name.toLowerCase().includes(name.toLowerCase())
      ) ?? [];

    setFilteredRepositories([...repositoriesWithName]);
  }

  const openDeleteModal = (repository: Repository) => {
    setRepositoryToDelete(repository);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (repositoryToDelete && currentOrganization && currentProduct) {
      try {
        const result = await handleRepositoryAction('delete', currentOrganization.id, currentProduct.id, repositoryToDelete.id, null);

        if (result.type === 'success') {
          const updatedRepositoryList = repositoryList?.filter((repo) => repo.id !== repositoryToDelete.id);
          setRepositoryList(updatedRepositoryList);
          toast.success('Repositório excluído com sucesso!');
        } else {
          toast.error('Erro ao excluir o repositório.');
        }
      } catch (error) {
        console.error('Error deleting repository:', error instanceof Error ? error.message : error);
      }
    }

    setShowDeleteModal(false);
  };

  useEffect(() => {
    if (repositoryList?.length) {
      setFilteredRepositories((prevState) => {
        const tempRepositoryList = [...repositoryList];
        const prevString = JSON.stringify(prevState);
        const currentString = JSON.stringify(tempRepositoryList);

        if (prevString !== currentString) {
          return tempRepositoryList;
        }

        return prevState;
      });
    }
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
            <TableCell style={{ paddingBottom: '35px' }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredRepositories?.slice(0, maxCount ?? filteredRepositories.length).map((repo) => (
            <TableRow hover style={{ cursor: 'pointer' }} data-testid="repository-row" key={repo.id}>
              <TableCell colSpan={2} onClick={() => handleClickRedirects(`${repo.id}-${repo.name}`)}>
                {repo.name}
              </TableCell>
              <TableCell align="right">
                <IconButton aria-label="delete" onClick={() => openDeleteModal(repo)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ConfirmationModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        itemName={repositoryToDelete?.name ?? ''}
        onConfirm={confirmDelete}
      />
    </TableContainer>
  );
};

export default RepositoriesTable;
