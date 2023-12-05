import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

import { TableContainer, Table, TableCell, TableHead, TableRow, TableBody, IconButton, Box } from '@mui/material';

import { styled } from '@mui/material/styles';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { Repository } from '@customTypes/repository';
import SearchButton from '@components/SearchButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useQuery } from '../../../repositories/hooks/useQuery';
import ConfirmationModal from '@components/ConfirmationModal';
import { FaGithub, FaGitlab, FaBitbucket, FaAws, FaCodeBranch } from 'react-icons/fa';
import { SiSubversion, SiMercurial, SiMicrosoftazure } from "react-icons/si";

interface Props {
  maxCount?: number;
}

const HoverIcon = styled('span')(({ theme }) => ({
  cursor: 'pointer',
  transition: 'opacity 0.3s',
  '&:hover': {
    opacity: 0.7,
  },
}));

const GitHubIcon: FC = () => <FaGithub size="1.5em" />;
const GitlabIcon: FC = () => <FaGitlab size="1.5em" />;
const BitbucketIcon: FC = () => <FaBitbucket size="1.5em" />;
const SubversionIcon: FC = () => <SiSubversion size="1.5em" />;
const MercurialIcon: FC = () => <SiMercurial size="1.5em" />;
const AwsIcon: FC = () => <FaAws size="1.5em" />;
const AzureIcon: FC = () => <SiMicrosoftazure size="1.5em" />;
const OutrosIcon: FC = () => <FaCodeBranch size="1.5em" />;

const platformIcons = {
  'github': () => <FaGithub size="1.5em" />,
  'gitlab': () => <FaGitlab size="1.5em" />,
  'bitbucket': () => <FaBitbucket size="1.5em" />,
  'subversion (SVN)': () => <SiSubversion size="1.5em" />,
  'mercurial': () => <SiMercurial size="1.5em" />,
  'aws code commit': () => <FaAws size="1.5em" />,
  'azure repos': () => <SiMicrosoftazure size="1.5em" />,
  'outros': () => <FaCodeBranch size="1.5em" />,
};

const RepositoriesTable: React.FC<Props> = ({ maxCount }: Props) => {
  const { currentProduct } = useProductContext();
  const { currentOrganization } = useOrganizationContext();
  const { repositoryList, setRepositoryList } = useRepositoryContext();
  const router = useRouter();
  const { handleRepositoryAction } = useQuery();

  const [filteredRepositories, setFilteredRepositories] = useState<Repository[]>([]);
  const [repositoryToDelete, setRepositoryToDelete] = useState<Repository | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleEditClick = (repositoryId: string) => {
    router.push(`/products/${currentOrganization?.id}-${currentProduct?.id}/repositories/manage-repository?id=${repositoryId}`);
  };

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

    console.log("Repositórios Filtrados:", repositoriesWithName);

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
        console.log("Repositórios Atuais:", tempRepositoryList);

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
                <Box display="flex" alignItems="center">
                  {repo.url ? (
                    <a href={repo.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                      <HoverIcon>
                        {platformIcons[repo.platform] ? platformIcons[repo.platform]() : platformIcons['outros']()}
                      </HoverIcon>
                    </a>
                  ) : (
                    <HoverIcon>
                      {platformIcons[repo.platform] ? platformIcons[repo.platform]() : platformIcons['outros']()}
                    </HoverIcon>
                  )}
                  <span style={{ marginLeft: 10 }}>{repo.name}</span>
                </Box>
              </TableCell>
              <TableCell align="right">
                <IconButton aria-label="edit" onClick={() => router.push(`/products/${currentOrganization?.id}-${currentProduct?.id}/repositories/manage-repository?id=${repo.id}`)}>
                  <EditIcon />
                </IconButton>
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
