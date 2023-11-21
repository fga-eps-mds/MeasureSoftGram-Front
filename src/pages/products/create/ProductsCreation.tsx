import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import getLayout from '@components/Layout';
import { toast } from 'react-toastify';
import { Container, TextField, Button, Typography, Box, Grid, MenuItem } from '@mui/material';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductQuery } from '../hooks/useProductQuery';

interface OrganizationsType extends React.FC {
  getLayout?: () => React.ReactNode;
}

const ProductsCreation: OrganizationsType = () => {
  const router = useRouter();
  const [nome, setName] = useState('');
  const [descricao, setDescription] = useState('');
  const [organizationId, setOrganizationId] = useState<number>();
  const { organizationList } = useOrganizationContext();
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const { createProduct, getProductById, updateProduct } = useProductQuery();
  const currentOrganizationId = router.query.id_organization;
  const currentProductId = router.query.id_product;

  useEffect(() => {
    const editMode = router.query.id_product;
    if (editMode) {
      setIsEditMode(true);
      const fetchProductData = async () => {
        const result = await getProductById(currentOrganizationId as string, currentProductId as string);
        if (result.type === 'success') {
          setName(result.value.name);
          setDescription(result.value.description || '');
          setOrganizationId(result.value.organizationId || 0);
        }
      };
      fetchProductData();
    }
  }, [router.query.id_product, currentOrganizationId, currentProductId, getProductById]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const novoProduto = {
      name: nome,
      description: descricao,
      organizationId,
    }
    let result;
    if (!novoProduto.organizationId && currentOrganizationId) {
      novoProduto.organizationId = parseInt(currentOrganizationId[0], 10);
    }
    const nameExist = "Já existe um Produto com este nome."
    if (isEditMode) {
      result = await updateProduct(currentProductId as string, novoProduto);
      if (result.type === 'success') {
        toast.success('Produto atualizado com sucesso!');
        setTimeout(() => {
          window.location.reload();
          window.location.href = '/home';
        }, 2000);
      } else if (result.error.message === nameExist) {
        toast.error(nameExist);
      } else {
        toast.error('Erro ao atualizar o Produto!');
      }
    } else {
      result = await createProduct(novoProduto);
      if (result.type === 'success') {
        toast.success('Produto criado com sucesso!');
        setTimeout(() => {
          window.location.reload();
          window.location.href = '/home';
        }, 2000);
      } else if (result.error.message === nameExist) {
        toast.error(nameExist);
      } else {
        toast.error('Erro ao criar o Produto!');
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
              onChange={(e) => setName(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Descrição"
              variant="outlined"
              value={descricao}
              onChange={(e) => setDescription(e.target.value)}
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
              value={organizationId || currentOrganizationId}
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
