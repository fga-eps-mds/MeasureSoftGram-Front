import { Box, Typography, Modal, TextField, List, ListItemButton, ListItem } from '@mui/material';
import { useEffect, useState } from 'react';
import { getUserRepos, Repo } from '@services/user';
import { useRouter } from 'next/router';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { getPathId } from '@utils/pathDestructer';
import { useQuery } from '../../../../../../../shared/hooks/useQuery';

type GithubRepositoriesModalProps = {
  open: boolean
  handleCloseModal: () => void
}


const styleModal = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
  height: 500,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 0,
};

const borderPrimaryStyle = '1px solid #2B4D6F'


export function GithubRepositoriesModal({ handleCloseModal, open }: GithubRepositoriesModalProps) {
  const router = useRouter();
  const [repos, setRepos] = useState<Repo[]>([])
  const { t } = useTranslation('repositories');


  const [filteredRepositories, setFilteredRepositories] = useState<Repo[]>([]);
  const code = router?.query?.code as string;
  const { handleRepositoryAction } = useQuery()
  const fetchUserRepos = async () => {
    const result = await getUserRepos(code);
    if (result.type === 'success' && Array.isArray(result.value.items)) {
      setRepos(result.value.items);
      setFilteredRepositories(result.value.items);
    } else {
      console.error(result.type)
    }
  }

  const handleCreateRepository = async (repository: Repo) => {
    const [organizationId, productId] = getPathId(router.query?.product as string);

    try {
      const result = await handleRepositoryAction(
        'create',
        organizationId || '',
        productId || '',
        undefined,
        {
          name: repository.name,
          description: repository.description,
          url: repository.html_url,
          platform: 'github',
          imported: true
        }
      );

      if (result.type === 'success') {
        toast.success(t('register.sucess'));
        // router.push(`/products/${currentOrganization?.id}-${currentProduct?.id}-${currentProduct?.name}/repositories`, undefined, { shallow: true });
        handleCloseModal()
      }
    } catch (error) {
      throw new Error(t('error.data'));
    }


  }


  useEffect(() => {
    if (code)
      fetchUserRepos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  function handleRepositoriesFilter(name: string) {
    if (!name) {
      setFilteredRepositories(repos);
      return;
    }
    const repositoriesWithName =
      repos?.filter((currentRepository) =>
        currentRepository.name.toLowerCase().includes(name.toLowerCase())
      ) ?? [];

    setFilteredRepositories(repositoriesWithName);
  }

  return <Modal
    open={open}
    onClose={handleCloseModal}
    aria-labelledby='modal-title'
  >
    <Box sx={{ ...styleModal, display: 'flex', flexDirection: 'column', justifyContent: 'between', alignItems: 'center' }} >
      <Typography id="modal-title" variant="h6" component="h2" sx={{ mb: 4, mt: 0, backgroundColor: '#2B4D6F', color: 'white', width: 700, display: 'flex', justifyContent: 'center' }}>
        {t('choose')}
      </Typography>



      <div style={{ width: '500px', display: 'flex' }}>
        <TextField
          id="search-bar"
          className="text"
          onChange={(e) => handleRepositoriesFilter(e.target.value)}
          variant="outlined"
          placeholder="Insira o nome do repositório"
          size="small"
          fullWidth
          style={
            {
              borderTopLeftRadius: '4px',
              borderTopRightRadius: '4px',
              border: borderPrimaryStyle
            }
          }
        />
      </div>
      <List style={{ background: 'white', overflowY: 'auto', width: '500px', maxHeight: '375px', margin: 0, padding: 0, borderRight: borderPrimaryStyle }}>
        {filteredRepositories.length === 0 ? <ListItem style={{ display: 'flex', borderLeft: borderPrimaryStyle, borderBottom: borderPrimaryStyle }}>{t('not-found')}</ListItem> : filteredRepositories.map((repository) => <ListItemButton onClick={() => { handleCreateRepository(repository) }} id="modal-modal-description" style={{ border: borderPrimaryStyle, borderTop: 0, borderRight: 0, height: 52.5, padding: 15, backgroundColor: "#F4F5F6", }} key={repository.id}>
          {repository.name}
        </ListItemButton>)}
      </List>
    </Box>
  </Modal>
}
