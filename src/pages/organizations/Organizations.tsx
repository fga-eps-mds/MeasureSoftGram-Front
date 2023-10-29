import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useOrganizationQuery } from './hooks/useOrganizationQuery';
import getLayout from '@components/Layout';
import { toast } from 'react-toastify';
import { getAllUsers, User } from '@services/user';
import { Container, TextField, Button, Typography, Box, Checkbox, FormControl, ListItem, List, Grid } from '@mui/material';
import Head from 'next/head';

interface OrganizationsType extends React.FC {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
}

const Organizations: OrganizationsType = () => {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [chave, setChave] = useState('');
  const [descricao, setDescricao] = useState('');
  const [membros, setMembros] = useState<string[]>([]);
  const { createOrganization, getOrganizationById, updateOrganization } = useOrganizationQuery();
  const [users, setUsers] = useState<User[]>([]);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const carregarMembrosDaOrganizacao = async () => {
    const result = await getAllUsers();
    console.log("Resultado da chamada de usuários: ", result);

    if (result.type === 'success' && Array.isArray(result.value.results)) {
      setUsers(result.value.results);
      console.log('Usuários definidos no estado:', result.value.results);
    } else {
      toast.error('Erro ao carregar os usuários.');
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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const novaOrganizacao = {
      name: nome,
      key: chave,
      description: descricao,
      members: membros,
    };

    const logDetails = () => {
      console.log('handleSubmit is being called');
      for (const [key, value] of Object.entries(novaOrganizacao)) {
        console.log(`${key.charAt(0).toUpperCase() + key.slice(1)}:`, value);
      }
    };

    logDetails();

    let result;

    if (isEditMode && router.query.edit) {
      result = await updateOrganization(router.query.edit as string, novaOrganizacao);
      if (result.type === 'success') {
        toast.success('Organização atualizada com sucesso!');
        router.push('/home');
      } else {
        toast.error('Erro ao atualizar a organização!');
      }
    } else {
      result = await createOrganization(novaOrganizacao);
      if (result.type === 'success') {
        toast.success('Organização criada com sucesso!');
        router.push('/home');
      } else {
        toast.error('Erro ao criar a organização!');
      }
    }

    console.log('Dados enviados:', novaOrganizacao);
    console.log('Resposta da API:', result);
  };



  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Head>
        <title>{isEditMode ? 'Editar Organização' : 'Cadastro de Organização'}</title>
      </Head>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Editar Organização' : 'Cadastro de Organização'}
      </Typography>
      <form onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Nome"
              variant="outlined"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Chave"
              variant="outlined"
              value={chave}
              onChange={(e) => setChave(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Descrição"
              variant="outlined"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Membros
            </Typography>
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <List sx={{ maxHeight: 200, overflowY: 'auto' }}>
                {Array.isArray(users) && users.length > 0 ? (
                  users.map((user) => (
                    <ListItem key={user.id} button onClick={() => handleToggleUser(user.username)}>
                      <Checkbox checked={membros.indexOf(user.username) > -1} />
                      {user.first_name} {user.last_name} ({user.username})
                    </ListItem>
                  ))
                ) : (
                  <Typography>Nenhum usuário disponível</Typography>
                )}
              </List>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                {isEditMode ? 'Salvar' : 'Criar'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

Organizations.getLayout = getLayout;

export default Organizations;
