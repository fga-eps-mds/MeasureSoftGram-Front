import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Box, Container, Typography, TextField, Button, Snackbar } from '@mui/material';
import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';
import { useRouter } from 'next/router';
import { useQuery } from '../hooks/useQuery';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RepositoryForm: NextPageWithLayout = () => {
  const router = useRouter();
  const { handleRepositoryAction } = useQuery();
  const { currentOrganization } = useOrganizationContext();
  const { currentProduct } = useProductContext();

  const [repositoryData, setRepositoryData] = useState({
    name: '',
    description: '',
    url: '',
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRepositoryData({ ...repositoryData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!currentOrganization?.id || !currentProduct?.id) {
        await router.push('/home');
        return;
      }

      const result = await handleRepositoryAction(
        'create',
        currentOrganization?.id || '',
        currentProduct?.id || '',
        undefined,
        repositoryData
      );

      if (result.type === 'success') {
        toast.success('Repositório criado com sucesso!');
        setSuccessMessage('Repositório criado com sucesso!');
        setErrorMessage('');
        setOpenSnackbar(true);
        router.push(`/products/${currentOrganization?.id}-${currentProduct?.id}/repositories`);
      } else {
        throw new Error(result.error?.message || 'An error occurred');
      }
    } catch (error) {
      toast.error('Erro ao criar o repositório!');
      setErrorMessage('Erro ao criar o repositório.');
      setSuccessMessage('');
      setOpenSnackbar(true);
      console.error('Error creating repository:', error instanceof Error ? error.message : error);
    }
  };

  useEffect(() => {
    if (!currentOrganization?.id || !currentProduct?.id) {
      router.push('/home');
    }
  }, [currentOrganization?.id, currentProduct?.id, router]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <>
      <Head>
        <title>Cadastro de Repositório</title>
      </Head>
      <Container>
        <Box display="flex" flexDirection="column" alignItems="center" marginTop="40px">
          <Typography variant="h4" fontWeight="500">
            Cadastro de Repositório
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              name="name"
              label="Nome do Repositório"
              variant="outlined"
              value={repositoryData.name}
              onChange={handleInputChange}
              margin="normal"
              fullWidth
              required
            />
            <TextField
              name="description"
              label="Descrição"
              variant="outlined"
              value={repositoryData.description}
              onChange={handleInputChange}
              margin="normal"
              fullWidth
              multiline
              rows={4}
            />
            <TextField
              name="url"
              label="URL do Repositório"
              variant="outlined"
              value={repositoryData.url}
              onChange={handleInputChange}
              margin="normal"
              fullWidth
            />
            <TextField
              name="product"
              label="Produto"
              variant="outlined"
              value={currentProduct?.name || ''}
              disabled
              margin="normal"
              fullWidth
              required
            />
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Button type="submit" variant="contained" color="primary">
                Criar
              </Button>
            </Box>
          </form>
          <Snackbar
            open={openSnackbar}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            message={successMessage || errorMessage}
          />
          <ToastContainer />
        </Box>
      </Container>
    </>
  );
};

RepositoryForm.getLayout = getLayout;

export default RepositoryForm;
