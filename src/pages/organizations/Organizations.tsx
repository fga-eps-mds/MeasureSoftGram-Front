import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useOrganizationQuery } from './hooks/useOrganizationQuery';
import getLayout from '@components/Layout';
import { toast } from 'react-toastify';
import { getAllUsers, User } from '@services/user';
import { Container, TextField, Button, Typography, Box, Checkbox, FormControl, ListItem, List } from '@mui/material';

interface OrganizationsType extends React.FC {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
}

const Organizations: OrganizationsType = () => {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [chave, setChave] = useState('');
  const [descricao, setDescricao] = useState('');
  const [membros, setMembros] = useState<string[]>([]);
  const { createOrganization } = useOrganizationQuery();
  const [users, setUsers] = useState<User[]>([]);

  const carregarMembrosDaOrganizacao = async () => {
    const result = await getAllUsers();
    console.log("Resultado da chamada de usuários: ", result);

    if (result.type === 'success' && Array.isArray(result.value)) {
      setUsers(result.value);
    } else {
      toast.error('Erro ao carregar os usuários.');
    }
  };

  useEffect(() => {
    carregarMembrosDaOrganizacao();
  }, []);

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

  const handleSubmit = async () => {

    console.log('handleSubmit is being called');

    console.log('Nome:', nome);
    console.log('Chave:', chave);
    console.log('Descricao:', descricao);
    console.log('Membros:', membros);

    const novaOrganizacao = {
      name: nome,
      key: chave,
      description: descricao,
      members: membros,
    };

    console.log('Nova Organizacao:', novaOrganizacao);

    const result = await createOrganization(novaOrganizacao);

    console.log('API response:', result);

    if (result.type === 'success') {
      console.log('Organização criada com sucesso!');
      toast.success('Organização criada com sucesso!');
      router.push('/home');
    } else {
      console.log('Erro ao criar a organização!');
      toast.error('Erro ao criar a organização!');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Cadastro de Organização
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Box sx={{ flex: '1', marginRight: 3 }}>
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
        </Box>
        <Box sx={{ flex: '1', marginLeft: 3 }}>
          <FormControl fullWidth variant="outlined" sx={{ mb: 2, height: 200 }}>
            <List>
              {Array.isArray(users) && users.map((user) => (
                <ListItem key={user.id} button onClick={() => handleToggleUser(user.username)}>
                  <Checkbox checked={membros.indexOf(user.username) > -1} />
                  {user.first_name} {user.last_name} ({user.username})
                </ListItem>
              ))}
            </List>
          </FormControl>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button
          type="button"
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          Criar
        </Button>
      </Box>
    </Container>
  );
};

Organizations.getLayout = getLayout;

export default Organizations;
