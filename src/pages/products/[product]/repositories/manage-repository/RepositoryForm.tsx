import React, { useState, useEffect, FC } from 'react';
import Head from 'next/head';
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Snackbar,
} from '@mui/material';
import { FaGithub, FaGitlab, FaBitbucket } from 'react-icons/fa';
import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';
import { useRouter } from 'next/router';
import { useQuery } from '../hooks/useQuery';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios, { AxiosError } from 'axios';

interface ApiErrorResponse {
  name?: string[];
  non_field_errors?: string[];
}

const GitHubIcon: FC = () => <FaGithub />;
const GitlabIcon: FC = () => <FaGitlab />;
const BitbucketIcon: FC = () => <FaBitbucket />;

const RepositoryForm: NextPageWithLayout = () => {
  const router = useRouter();
  const { handleRepositoryAction } = useQuery();
  const { currentOrganization } = useOrganizationContext();
  const { currentProduct } = useProductContext();

  const [repositoryData, setRepositoryData] = useState({
    name: '',
    description: '',
    url: '',
    platform: 'github',
  });

  const platforms = [
    { value: 'github', label: 'GitHub', icon: <GitHubIcon /> },
    { value: 'gitlab', label: 'GitLab', icon: <GitlabIcon /> },
    { value: 'bitbucket', label: 'Bitbucket', icon: <BitbucketIcon /> },
  ];

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRepositoryData({ ...repositoryData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentOrganization?.id || !currentProduct?.id) {
      await router.push('/home');
      return;
    }

    try {
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
        setOpenSnackbar(true);
        router.push(`/products/${currentOrganization?.id}-${currentProduct?.id}/repositories`);
      } else if (result.type === 'error') {
        handleResultError(result.error);
      }
    } catch (error: any) {
      handleCatchError(error);
    }
  };

  function handleResultError(error: any) {
    let errorMsg = error?.message || 'Erro ao criar repositório.';
    if (error?.response?.data?.non_field_errors?.includes('Repository with this name already exists.')) {
      errorMsg = 'Já existe um repositório com este nome.';
    }

    toast.error(errorMsg);
    setErrorMessage(errorMsg);
    setOpenSnackbar(true);
  }

  function handleCatchError(error: any) {
    let errorMsg = 'Erro desconhecido ao criar repositório.';
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data as ApiErrorResponse;
      if (apiError.non_field_errors?.includes('Repository with this name already exists.')) {
        errorMsg = 'Já existe um repositório com este nome.';
      } else if (apiError.non_field_errors) {
        errorMsg = apiError.non_field_errors[0];
      }
    }

    toast.error(errorMsg);
    setErrorMessage(errorMsg);
    setOpenSnackbar(true);
  }



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
        <Box display="flex" flexDirection="column" alignItems="flex-start" marginTop="40px">
          <Typography variant="h4">Cadastro de Repositório</Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <TextField
                  name="product"
                  label="Produto"
                  variant="outlined"
                  value={currentProduct?.name || ''}
                  disabled
                  margin="normal"
                  fullWidth
                  required
                  InputProps={{
                    style: { backgroundColor: '#f0f0f0' },
                  }}
                />
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
              </Grid>
              <Grid item xs={6} style={{ paddingTop: '48px' }}>
                <Typography variant="h6" gutterBottom>
                  Sistema de Controle de Versão
                </Typography>
                <TextField
                  name="url"
                  label="URL do Repositório"
                  variant="outlined"
                  value={repositoryData.url}
                  onChange={handleInputChange}
                  margin="normal"
                  fullWidth
                />
                <Box display="flex" alignItems="center" margin="normal">
                  <FormControl style={{ flex: 1 }} margin="normal">
                    <InputLabel id="platform-label">Plataforma</InputLabel>
                    <Select
                      labelId="platform-label"
                      id="platform"
                      value={repositoryData.platform}
                      label="Plataforma"
                      onChange={(e) => setRepositoryData({ ...repositoryData, platform: e.target.value as string })}
                    >
                      {platforms.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Box ml={2} display="flex" alignItems="center">
                    {platforms.find((p) => p.value === repositoryData.platform)?.icon &&
                      React.cloneElement(platforms.find((p) => p.value === repositoryData.platform).icon, {
                        size: '2em',
                      })}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button type="submit" variant="contained" color="primary">
                    Criar
                  </Button>
                </Box>
              </Grid>
            </Grid>
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
