import React, { useState, useEffect, FC } from 'react';
import Head from 'next/head';
import {
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
import { FaGithub, FaGitlab, FaBitbucket, FaAws, FaCodeBranch } from 'react-icons/fa';
import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';
import { useRouter } from 'next/router';
import { useQuery } from '../hooks/useQuery';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios, { AxiosError } from 'axios';
import { SiSubversion, SiMercurial, SiMicrosoftazure } from "react-icons/si";

interface ApiErrorResponse {
  name?: string[];
  non_field_errors?: string[];
  url?: string[];
}

const GitHubIcon: FC = () => <FaGithub size="1.5em" />;
const GitlabIcon: FC = () => <FaGitlab size="1.5em" />;
const BitbucketIcon: FC = () => <FaBitbucket size="1.5em" />;
const SubversionIcon: FC = () => <SiSubversion size="1.5em" />;
const MercurialIcon: FC = () => <SiMercurial size="1.5em" />;
const AwsIcon: FC = () => <FaAws size="1.5em" />;
const AzureIcon: FC = () => <SiMicrosoftazure size="1.5em" />;
const OutrosIcon: FC = () => <FaCodeBranch size="1.5em" />;

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
    { value: 'subversion (SVN)', label: 'Subversion (SVN)', icon: <SubversionIcon /> },
    { value: 'mercurial', label: 'Mercurial', icon: <MercurialIcon /> },
    { value: 'aws code commit', label: 'AWS CodeCommit', icon: <AwsIcon /> },
    { value: 'azure repos', label: 'Azure Repos', icon: <AzureIcon /> },
    { value: 'outros', label: 'Outros', icon: <OutrosIcon /> },
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
      console.log("Enviando dados do repositório:", repositoryData);
      const result = await handleRepositoryAction(
        'create',
        currentOrganization?.id || '',
        currentProduct?.id || '',
        undefined,
        repositoryData
      );
      console.log("Resultado da ação do repositório:", result);

      if (result.type === 'success') {
        toast.success('Repositório criado com sucesso!');
        router.push(`/products/${currentOrganization?.id}-${currentProduct?.id}/repositories`);
      } else if (result.type === 'error') {
        console.log("Chamando handleResultError com:", result.error);
        handleResultError(result.error);
      }
    } catch (error: any) {
      handleCatchError(error);
    }
  };


  function handleResultError(error: AxiosError<ApiErrorResponse>) {
    console.log("Error response:", error.response);

    let errorMsg = 'Erro ao criar repositório.';

    if (error.response) {
      const errorCode = error.response.status;
      const errorData = error.response.data;

      console.log("Error code:", errorCode);
      console.log("Error data:", errorData);

      if (errorCode === 400 && errorData && 'url' in errorData) {
        const urlErrors = errorData.url;

        if (Array.isArray(urlErrors) && urlErrors.length > 0) {
          const urlErrorMessage = urlErrors[0];

          switch (urlErrorMessage) {
            case "The URL must start with http or https.":
              console.log("Erro: A URL deve começar com http ou https.");
              errorMsg = 'A URL deve começar com http ou https.';
              break;
            case "The repository's URL is not accessible.":
              console.log("Erro: A URL do repositório não é acessível.");
              errorMsg = 'A URL do repositório não é acessível.';
              break;
            case "Unable to verify the repository's URL.":
              console.log("Erro: Não foi possível verificar a URL do repositório.");
              errorMsg = 'Não foi possível verificar a URL do repositório.';
              break;
            default:
              console.log("Erro padrão:", urlErrorMessage);
              errorMsg = urlErrorMessage;
          }
        }
      }
    }

    toast.error(errorMsg);
    setErrorMessage(errorMsg);
    setOpenSnackbar(true);
  }



  function handleCatchError(error: any) {
    let errorMsg = 'Erro desconhecido ao criar repositório.';
    if (axios.isAxiosError(error) && error.response) {
      const apiError = error.response.data as ApiErrorResponse;
      errorMsg = apiError.non_field_errors?.[0] || 'Erro ao criar repositório.';
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
            <Box width="100%">
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
              <TextField
                name="url"
                label="URL do Repositório"
                variant="outlined"
                value={repositoryData.url}
                onChange={handleInputChange}
                margin="normal"
                fullWidth
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="platform-label">Plataforma</InputLabel>
                <Select
                  labelId="platform-label"
                  id="platform"
                  value={repositoryData.platform}
                  label="Plataforma"
                  onChange={(e) => setRepositoryData({ ...repositoryData, platform: e.target.value as string })}
                  renderValue={(value) => (
                    <Box display="flex" alignItems="center">
                      <Box marginRight="10px">{platforms.find((p) => p.value === value)?.icon}</Box>
                      {platforms.find((p) => p.value === value)?.label}
                    </Box>
                  )}
                >
                  {platforms.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box marginRight="10px">{React.cloneElement(option.icon)}</Box>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                <Button type="submit" variant="contained" color="primary">
                  Criar
                </Button>
              </Box>
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
