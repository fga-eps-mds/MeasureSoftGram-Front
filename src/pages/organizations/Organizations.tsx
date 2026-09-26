import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import getLayout from '@components/Layout';
import { toast } from 'react-toastify';
import { getAllUsers, User } from '@services/user';
import { TextField, Button, Typography, Box, List, ListItem, ListItemText, Modal, Fade, FormControl } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import MSGButton from '../../components/idv/buttons/MSGButton';
import { useOrganizationQuery } from './hooks/useOrganizationQuery';
import { Title, Container, Wrapper, Description, Form, Header } from './styles';

interface OrganizationsType extends React.FC {
  getLayout?: (_page: React.ReactElement) => React.ReactNode;
}

const Organizations: OrganizationsType = () => {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [chave, setChave] = useState('');
  const [descricao, setDescricao] = useState('');
  const [membros, setMembros] = useState<string[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const { createOrganization, getOrganizationById, updateOrganization } = useOrganizationQuery();
  const { setCurrentOrganizations, fetchOrganizations } = useOrganizationContext();
  const [users, setUsers] = useState<User[]>([]);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const { t } = useTranslation('organization');

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const carregarMembrosDaOrganizacao = async () => {
    const result = await getAllUsers();

    if (result.type === 'success' && Array.isArray(result.value.results)) {
      setUsers(result.value.results);
    } else {
      toast.error(t('toast.load-users'));
    }
  };

  useEffect(() => {
    carregarMembrosDaOrganizacao();

    const editMode = router.query.edit;
    if (editMode) {
      setIsEditMode(true);
      const fetchOrganizationData = async () => {
        const result = await getOrganizationById(editMode as string);
        if (result.type === 'success') {
          setNome(result.value.name);
          setChave(result.value.key || '');
          setDescricao(result.value.description || '');
          setMembros(result.value.members || []);
        }
      };
      fetchOrganizationData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.edit]);


  const handleToggleUser = (username: string) => {
    const currentIndex = membros.indexOf(username);
    const newMembros = [...membros];

    if (currentIndex === -1) {
      newMembros.push(username);
    } else {
      newMembros.splice(currentIndex, 1);
    }

    setMembros(newMembros);
  };

  const handleResultError = (result: any, defaultErrorMsg: string) => {
    const nameExist = t('toast.name-exists');
    const keyExist = t('toast.key-exists');
    if (result.error?.message === nameExist) {
      toast.error(nameExist);
    } else if (result.error?.message === keyExist) {
      toast.error(keyExist);
    } else {
      toast.error(t(defaultErrorMsg));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const novaOrganizacao = {
      name: nome,
      key: chave,
      description: descricao,
      members: membros,
    };

    let result;
    if (isEditMode && router.query.edit) {
      result = await updateOrganization(router.query.edit as string, novaOrganizacao);
      if (result.type === 'success') {
        toast.success(t('toast.sucess-edit'));
        setTimeout(() => {
          router.push('/home');
        }, 2000);
      } else {
        handleResultError(result, 'toast.error-edit');
      }
    } else {
      result = await createOrganization(novaOrganizacao);
      if (result.type === 'success') {
        toast.success(t('toast.sucess'));
        const createdOrg = result.value as any;
        if (createdOrg && createdOrg.id) {
          localStorage.setItem('selectedOrgId', JSON.stringify(createdOrg.id.toString()));
          setCurrentOrganizations([createdOrg]);
        }
        fetchOrganizations(true);
        setTimeout(() => {
          router.push('/home');
        }, 2000);
      } else {
        handleResultError(result, 'toast.error');
      }
    }
  };

  return (
    <Container>
      <Header data-testid="organization-title">{isEditMode ? t('title-edit') : t('title-create')}</Header>
      <Wrapper>
        <Description>
          {t('description')}
        </Description>
        <form onSubmit={handleSubmit}>
          <Form>
            <TextField
              fullWidth
              label={t('input-name')}
              variant="outlined"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              sx={{ mb: 2 }}
              data-testid="input-nome"
            />

            <TextField
              fullWidth
              label={t('input-description')}
              variant="outlined"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              multiline
              sx={{ mb: 2 }}
              data-testid="input-descricao"
            />
            <MSGButton variant='secondary' onClick={handleOpenModal}  >{t('add-members')}</MSGButton>

            <MSGButton type='submit' >{isEditMode ? t('save') : t('create')}</MSGButton>
          </Form>
        </form>

      </Wrapper>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
      >
        <Fade in={openModal}>
          <Box sx={{ width: 400, p: 3, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', boxShadow: 24, borderRadius: 1 }}>
            <Title>
              {t('add-members')}
            </Title>
            <hr />
            <FormControl fullWidth variant="outlined">
              <List sx={{ maxHeight: '300px', overflowY: 'auto' }}>
                {Array.isArray(users) && users.length > 0 ? (
                  users.map((user) => {
                    const isMember: boolean = membros.indexOf(user.username) > -1;
                    return (
                      <ListItem key={user.id}>
                        <ListItemText>
                          {user.first_name} {user.last_name} ({user.username})
                        </ListItemText>
                        <Button
                          variant={isMember ? "outlined" : "contained"}
                          color="primary"
                          onClick={() => handleToggleUser(user.username)}
                          sx={{ opacity: isMember ? 0.5 : 1 }}
                        >
                          {isMember ? 'Adicionado' : 'Adicionar'}
                        </Button>
                      </ListItem>
                    );
                  })
                ) : (
                  <Typography>{t('none-user')}</Typography>
                )}
              </List>
            </FormControl>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button color="primary" onClick={handleCloseModal}>
                {t('close')}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Container >
  );
};

Organizations.getLayout = getLayout;

export default Organizations;
