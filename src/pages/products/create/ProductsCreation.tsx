import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import getLayout from '@components/Layout';
import { toast } from 'react-toastify';
import { Container, TextField, Button, Typography, Box, List, ListItem, ListItemText, Modal, Backdrop, Fade, Grid, FormControl, MenuItem } from '@mui/material';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductQuery } from '../hooks/useProductQuery';

interface OrganizationsType extends React.FC {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
}

const ProductsCreation: OrganizationsType = () => {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [organizationId, setOrganizationId] = useState<number>();
  const { organizationList } = useOrganizationContext();
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const { createProduct } = useProductQuery();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const novoProduto = {
      name: nome,
      description: descricao,
      organizationId: organizationId,
    }
    let result;
    const nameExist = "Já existe uma Produto com este nome."
    const keyExist = "Já existe uma Produto com esta chave."
    if (isEditMode && router.query.edit) {
      // result = await updateOrganization(router.query.edit as string, novaOrganizacao);
      //  if (result.type === 'success') {
      //    toast.success('Produto atualizada com sucesso!');
      //    router.push('/home');
      //  } else if (result.error.message === nameExist) {
      //    toast.error(nameExist);
      //  } else if (result.error.message === keyExist) {
      //    toast.error(keyExist);
      //  } else {
      //    toast.error('Erro ao atualizar a Produto!');
      //  }
    } else {
      result = await createProduct(novoProduto);
      if (result.type === 'success') {
        toast.success('Produto criado com sucesso!');
        router.push('/home');
      } else if (result.error.message === nameExist) {
        toast.error(nameExist);
      } else if (result.error.message === keyExist) {
        toast.error(keyExist);
      } else {
        toast.error('Erro ao criar a Produto!');
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Head>
        <title>{isEditMode ? 'Editar Produto' : 'Cadastro de Produto'}</title>
      </Head>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Editar Produto' : 'Cadastro de Produto'}
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
            <TextField
              select
              required
              fullWidth
              label="Organizações"
              variant="outlined"
              value={organizationId}
              onChange={(e) => setOrganizationId(+e.target.value)}
              multiline
              rows={4}
              sx={{ mb: 2 }}
            >
              {
                organizationList?.map((organization) => (
                  <MenuItem key={organization.id} value={organization.id}>{organization.name}</MenuItem>
                ))
              }
            </TextField>
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

ProductsCreation.getLayout = getLayout;

export default ProductsCreation;
