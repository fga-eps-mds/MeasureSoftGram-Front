import React, { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Head from "next/head";
import {
  Container,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Tabs,
  Tab,
  List,
  ListItem,
  Button,
  Chip,
  Paper,
  InputAdornment,
  CircularProgress,
  Link,
  Pagination
} from "@mui/material";
import { Search, CheckCircle, AddCircle, GitHub, FolderSpecial } from "@mui/icons-material";
import { NextPageWithLayout } from "@pages/_app.next";
import getLayout from "@components/Layout";
import useRequireAuth from "@hooks/useRequireAuth";
import { toast } from "react-toastify";
import { organizationQuery } from "@services/organization";
import { useRouter } from "next/router";
import { productQuery } from "@services/product";
import { repository } from "@services/repository";
import { useOrganizationContext } from "@contexts/OrganizationProvider";
import { useProductContext } from "@contexts/ProductProvider";
import { getGithubReauthorizeUrl, getGitlabAuthUrl } from "@services/Auth";
import { createOAuthState } from "@services/Auth/oauthState";
import { isSameGithubOrg } from "@utils/isSameGithubOrg";
import { FaGitlab } from 'react-icons/fa';
import { useProviderTerms } from '@hooks/useProviderTerms';
import { refreshRepositoryList } from '@hooks/useRepositoryList';

interface ProductType {
  id: string | number;
  name: string;
}

interface ProviderNamespaceItem {
  id: number | string;
  name: string;
  description?: string;
  avatar_url?: string;
  kind?: 'user' | 'group';
  full_path?: string;
  github_org_id?: number;
  github_org_name?: string;
}

interface UnifiedRepoItem {
  github_repo_id?: number;
  gitlab_project_id?: number;
  github_full_name?: string;
  gitlab_path_with_namespace?: string;
  name: string;
  description?: string;
  url: string;
}

const Products: NextPageWithLayout = () => {
  const { terms, provider } = useProviderTerms();
  useRequireAuth();
  const { t: tp } = useTranslation('product');
  const router = useRouter();

  const { organizationList, setCurrentOrganizations, fetchOrganizations, currentOrganization } = useOrganizationContext();
  const { setCurrentProduct, updateProductList, currentProduct } = useProductContext();

  const [providerNamespaces, setProviderNamespaces] = useState<ProviderNamespaceItem[]>([]);
  const [selectedOrgName, setSelectedOrgName] = useState<string>('');
  const [selectedOrgDbId, setSelectedOrgDbId] = useState<string>('');

  const [products, setProducts] = useState<ProductType[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  const [gitHubRepos, setGitHubRepos] = useState<UnifiedRepoItem[]>([]);
  const [importedRepoUrls, setImportedRepoUrls] = useState<string[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState<boolean>(true);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [loadingRepos, setLoadingRepos] = useState<boolean>(false);
  const [repoFetchError, setRepoFetchError] = useState<'409' | 'error' | null>(null);
  const [search, setSearch] = useState("");
  const [tabValue, setTabValue] = useState(0);

  const [page, setPage] = useState(1);
  const [gitlabTotalPages, setGitlabTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setPage(1);
    if (provider === 'gitlab') {
      setGitlabTotalPages(1);
    }
  }, [search, tabValue, selectedOrgName, provider]);

  useEffect(() => {
    if (provider !== 'gitlab') {
      setPage(1);
    }
  }, [gitHubRepos, provider]);

  const lastLoadedProductIdRef = useRef<string>('');
  const prevGitlabQueryRef = useRef({ page: 1, search: '', orgName: '', orgDbId: '' });

  const resolveTargetOrg = async (): Promise<any> => {
    if (currentOrganization) return currentOrganization;
    const savedOrgId = localStorage.getItem('selectedOrgId');
    if (!savedOrgId) return null;
    try {
      const parsedId = JSON.parse(savedOrgId);
      const foundInList = organizationList.find(o => String(o.id) === String(parsedId));
      if (foundInList) return foundInList;
      const orgRes = await organizationQuery.getOrganizationById(parsedId);
      if (orgRes.type === 'success') {
        return orgRes.value;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const resolveDefaultOrgName = async (namespaces: ProviderNamespaceItem[]): Promise<string> => {
    if (namespaces.length === 0) return '';
    const targetOrg = await resolveTargetOrg();
    if (targetOrg) {
      const matchGo = namespaces.find(go =>
        isSameGithubOrg(go.name, targetOrg?.name, targetOrg?.key, (targetOrg as any)?.github_org_name)
      );
      if (matchGo) {
        return matchGo.name;
      }
    }
    return namespaces[0].name;
  };

  const loadProviderNamespaces = async () => {
    setLoadingOrgs(true);
    try {
      let namespaces: ProviderNamespaceItem[] | null = null;
      if (provider === 'gitlab') {
        const res = await organizationQuery.getGitLabNamespaces();
        if (res.type === 'success') {
          namespaces = res.value.map(ns => ({
            id: ns.id,
            name: ns.name,
            full_path: ns.full_path,
            description: ns.description,
            avatar_url: ns.avatar_url,
            kind: ns.kind,
            github_org_id: ns.id,
            github_org_name: ns.name
          }));
        } else {
          toast.error(`Erro ao buscar ${terms.organizations} do ${terms.providerName}.`);
        }
      } else {
        const res = await organizationQuery.getGithubOrganizations();
        if (res.type === 'success') {
          namespaces = res.value.map(go => ({
            id: go.github_org_id,
            name: go.github_org_name,
            description: go.description,
            avatar_url: go.avatar_url,
            github_org_id: go.github_org_id,
            github_org_name: go.github_org_name
          }));
        } else {
          toast.error(`Erro ao buscar ${terms.organizations} do ${terms.providerName}.`);
        }
      }

      if (namespaces) {
        setProviderNamespaces(namespaces);
        if (namespaces.length > 0) {
          const defaultName = await resolveDefaultOrgName(namespaces);
          setSelectedOrgName(defaultName);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(`Erro ao carregar ${terms.organizations}.`);
    } finally {
      setLoadingOrgs(false);
    }
  };

  const getBackendOrgId = async (orgName: string): Promise<string> => {
    const res = await organizationQuery.getAllOrganization();
    if (res.type !== 'success') return '';
    const match = res.value.find((o: any) =>
      isSameGithubOrg(orgName, o.name, o.key, o.github_org_name)
    );
    return match?.id || '';
  };

  const importOrg = async (orgName: string): Promise<string> => {
    if (provider === 'gitlab') {
      const createRes = await organizationQuery.createOrganization({ name: orgName });
      if (createRes.type === 'success' && createRes.value?.id) {
        await fetchOrganizations();
        return String(createRes.value.id);
      }
      const res = await organizationQuery.getAllOrganization();
      if (res.type === 'success') {
        const found = res.value.find((o: any) => o.name?.toLowerCase() === orgName.toLowerCase());
        if (found?.id) return String(found.id);
      }
      return '';
    }
    const importResult = await organizationQuery.importOrganization(orgName);
    if (importResult.type === 'success' && importResult.value.id) {
      await fetchOrganizations(); // Removido o 'true'
      return importResult.value.id;
    }
    return '';
  };

  const handleSelectOrgRef = useRef<boolean>(false);

  const loadProductsForOrg = async (orgDbId: string) => {
    const productsRes = await productQuery.getAllProducts(orgDbId);
    const productList = (productsRes.data?.results || productsRes.data || []) as ProductType[];
    setProducts(productList);
    updateProductList(productList as any);
    if (productList.length > 0) {
      let defaultProductId = String(productList[0].id);
      if (currentProduct) {
        const matchProduct = productList.find(p => String(p.id) === String(currentProduct.id));
        if (matchProduct) defaultProductId = String(matchProduct.id);
      }
      setSelectedProductId(defaultProductId);
    } else {
      setSelectedProductId('');
    }
  };

  const loadGithubReposForOrg = async (orgDbId: string) => {
    setRepoFetchError(null);
    const reposRes = await organizationQuery.getGithubRepos(orgDbId);
    if (reposRes.type === 'success') {
      setGitHubRepos(reposRes.value);
    } else {
      const status = reposRes.error?.response?.status;
      if (status === 409) {
        setRepoFetchError('409');
        toast.error(`Token do ${terms.providerName} expirado ou inválido.`);
      } else {
        setRepoFetchError('error');
        toast.error(`Erro ao buscar ${terms.repositories} do ${terms.providerName}.`);
      }
    }
  };

  const loadGitLabProjectsForOrg = async (
    orgDbId: string,
    namespace?: ProviderNamespaceItem,
    targetPage: number = page,
    searchTerm: string = search
  ) => {
    if (!orgDbId) return;
    setLoadingRepos(true);
    setRepoFetchError(null);
    try {
      const res = await organizationQuery.getGitLabProjects(
        orgDbId,
        namespace?.id,
        namespace?.kind,
        targetPage,
        searchTerm
      );
      if (res.type === 'success') {
        const { projects, totalPages, nextPage } = res.value;
        const mappedRepos: UnifiedRepoItem[] = projects.map(p => ({
          ...p,
          github_repo_id: p.gitlab_project_id,
          github_full_name: p.gitlab_path_with_namespace
        }));
        setGitHubRepos(mappedRepos);
        // A paginação vem dos headers do GitLab, que o service repassa; a página dele tem 50 itens.
        if (totalPages) {
          setGitlabTotalPages(totalPages);
        } else if (nextPage) {
          setGitlabTotalPages(prev => Math.max(prev, nextPage));
        } else {
          setGitlabTotalPages(targetPage);
        }
      } else {
        const status = res.error?.response?.status;
        if (status === 409) {
          setRepoFetchError('409');
          toast.error(`Token do ${terms.providerName} expirado ou inválido.`);
        } else {
          setRepoFetchError('error');
          toast.error(`Erro ao buscar ${terms.repositories} do ${terms.providerName}.`);
        }
      }
    } catch (err) {
      console.error(err);
      setRepoFetchError('error');
      toast.error(`Erro ao carregar ${terms.repositories}.`);
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleSelectOrganization = async (orgName: string) => {
    if (!orgName) return;
    if (handleSelectOrgRef.current) return;
    handleSelectOrgRef.current = true;
    setLoadingProducts(true);
    setLoadingRepos(true);
    setProducts([]);
    setGitHubRepos([]);
    setImportedRepoUrls([]);
    try {
      let orgDbId = await getBackendOrgId(orgName);

      if (!orgDbId) {
        orgDbId = await importOrg(orgName);
        if (!orgDbId) {
          toast.error(`Erro ao importar ${terms.organization} no MeasureSoftGram.`);
          return;
        }
      }

      setSelectedOrgDbId(orgDbId);
      await loadProductsForOrg(orgDbId);
      if (provider === 'gitlab') {
        const currentNs = providerNamespaces.find(ns => ns.name === orgName || ns.full_path === orgName);
        prevGitlabQueryRef.current = { page: 1, search: '', orgName, orgDbId };
        await loadGitLabProjectsForOrg(orgDbId, currentNs, 1, '');
      } else {
        await loadGithubReposForOrg(orgDbId);
      }

    } catch (error: any) {
      console.error(error);
      toast.error(`Erro de comunicação com o servidor.`);
    } finally {
      setLoadingProducts(false);
      setLoadingRepos(false);
      handleSelectOrgRef.current = false;
    }
  };

  const loadProductRepositories = async (orgDbId: string, productId: string) => {
    if (!orgDbId || !productId) return;
    try {
      const res = await productQuery.getAllRepositories(orgDbId, productId);
      const repoList = res?.data?.results || res?.data || [];
      const urls = repoList.map((r: any) => r.url);
      setImportedRepoUrls(urls);
      if (lastLoadedProductIdRef.current !== productId) {
        lastLoadedProductIdRef.current = productId;
        if (urls.length === 0) {
          setTabValue(2); // "A Importar"
        } else {
          setTabValue(0); // "Importados"
        }
      }
    } catch (error) {
      console.error("Erro ao carregar projetos importados:", error);
    }
  };

  const handleImport = async (repo: UnifiedRepoItem) => {
    if (!selectedOrgDbId || !selectedProductId) return;
    try {
      const response = await repository.createRepository(selectedOrgDbId, selectedProductId, {
        name: repo.name,
        url: repo.url,
        description: repo.description || '',
        platform: provider === 'gitlab' ? 'gitlab' : 'github',
        imported: true
      });
      if (response.type === 'success') {
        toast.success(`${terms.Repository} ${repo.name} importado com sucesso!`);
        void loadProductRepositories(selectedOrgDbId, selectedProductId);
        // a lista guardada para as outras telas do produto também passa a ter o repositório importado
        void refreshRepositoryList(selectedOrgDbId, selectedProductId);
      } else {
        toast.error(`Erro ao importar ${terms.repository}: ${response.error.message || 'Erro desconhecido'}`);
      }
    } catch (error: any) {
      toast.error(`Erro ao importar ${terms.repository}: ${error.message || 'Erro desconhecido'}`);
    }
  };

  // Volta para esta tela pelo callback do OAuth, que valida o state e renova o token.
  const handleReauthorize = () => {
    try {
      const state = createOAuthState(provider === 'gitlab' ? 'gitlab' : 'github', '/products');
      window.location.assign(provider === 'gitlab' ? getGitlabAuthUrl(state) : getGithubReauthorizeUrl(state));
    } catch (error) {
      console.error(error);
      toast.error(`Não foi possível iniciar a autorização do ${terms.providerName}.`);
    }
  };

  useEffect(() => {
    void loadProviderNamespaces();
  }, [provider]);

  useEffect(() => {
    if (selectedOrgName) {
      void handleSelectOrganization(selectedOrgName);
    }
  }, [selectedOrgName]);

  useEffect(() => {
    if (provider !== 'gitlab' || !selectedOrgDbId) return;

    const prev = prevGitlabQueryRef.current;
    if (
      prev.page === page &&
      prev.search === search &&
      prev.orgName === selectedOrgName &&
      prev.orgDbId === selectedOrgDbId
    ) {
      return;
    }

    const currentNs = providerNamespaces.find(ns => ns.name === selectedOrgName || ns.full_path === selectedOrgName);
    const delay = prev.search !== search ? 400 : 0;

    const timer = setTimeout(() => {
      prevGitlabQueryRef.current = { page, search, orgName: selectedOrgName, orgDbId: selectedOrgDbId };
      void loadGitLabProjectsForOrg(selectedOrgDbId, currentNs, page, search);
    }, delay);

    return () => clearTimeout(timer);
  }, [provider, selectedOrgDbId, selectedOrgName, page, search, providerNamespaces]);

  // eslint-disable-next-line sonarjs/cognitive-complexity
  useEffect(() => {
    if (currentOrganization && providerNamespaces.length > 0) {
      const matchGo = providerNamespaces.find(go =>
        isSameGithubOrg(go.name, currentOrganization?.name, currentOrganization?.key, (currentOrganization as any)?.github_org_name)
      );
      if (matchGo) {
        if (matchGo.name !== selectedOrgName) {
          setSelectedOrgName(matchGo.name);
        }
      } else if (selectedOrgName !== '') {
        setSelectedOrgName('');
        setProducts([]);
        setGitHubRepos([]);
        setImportedRepoUrls([]);
        setSelectedProductId('');
      }
    }
  }, [currentOrganization, providerNamespaces]);

  useEffect(() => {
    if (selectedOrgDbId && selectedProductId) {
      void loadProductRepositories(selectedOrgDbId, selectedProductId);
    }
  }, [selectedOrgDbId, selectedProductId]);

  useEffect(() => {
    if (selectedOrgDbId && organizationList.length > 0) {
      const match = organizationList.find(o => String(o.id) === String(selectedOrgDbId));
      if (match) {
        setCurrentOrganizations([match]);
      }
    }
  }, [selectedOrgDbId, organizationList]);

  useEffect(() => {
    if (selectedProductId && products.length > 0) {
      const match = products.find(p => String(p.id) === String(selectedProductId));
      if (match) {
        setCurrentProduct(match as any);
      }
    }
  }, [selectedProductId, products]);

  useEffect(() => {
    if (currentProduct && products.length > 0 && String(currentProduct.id) !== selectedProductId) {
      setSelectedProductId(String(currentProduct.id));
    }
  }, [currentProduct, products]);

  const filteredRepos = useMemo(
    () =>
      gitHubRepos.filter((repo) => {
        const isAlreadyImported = importedRepoUrls.some(
          url => url && repo.url && (url === repo.url || url.toLowerCase() === repo.url.toLowerCase())
        );
        const matchesSearch =
          provider === 'gitlab'
            ? true
            : (repo.name?.toLowerCase().includes(search.toLowerCase()) || false);
        const matchesTab =
          (tabValue === 0 && isAlreadyImported) || tabValue === 1 || (tabValue === 2 && !isAlreadyImported);
        return matchesSearch && matchesTab;
      }),
    [gitHubRepos, importedRepoUrls, search, tabValue, provider]
  );

  const displayedRepos = useMemo(() => {
    if (provider === 'gitlab') {
      return filteredRepos;
    }
    return filteredRepos.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [provider, filteredRepos, page, itemsPerPage]);

  return (
    <>
      <Head>
        <title>{tp('title')} - MeasureSoftGram</title>
      </Head>
      <Container>
        <Box display="flex" flexDirection="column" gap="2rem" paddingY="2rem">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom color="text.primary">
                {`Importação de ${terms.Repositories}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {`Selecione ${terms.yourOrganization} e o produto correspondente para gerenciar seus ${terms.repositories}.`}
              </Typography>
            </Box>
            {provider === 'gitlab' ? (
              <FaGitlab size="2.5rem" color="#fc6d26" />
            ) : (
              <GitHub color="action" sx={{ fontSize: '2.5rem' }} />
            )}
          </Box>

          <Paper variant="outlined" sx={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Box display="flex" flexDirection="column" gap="0.5rem">
              <FormControl fullWidth size="medium" disabled={loadingOrgs}>
                <InputLabel id="org-select-label">
                  {loadingOrgs ? `Carregando ${terms.organizations}...` : `${terms.Organizations} do ${terms.providerName}`}
                </InputLabel>
                <Select
                  labelId="org-select-label"
                  value={selectedOrgName}
                  label={`${terms.Organizations} do ${terms.providerName}`}
                  onChange={(e) => setSelectedOrgName(e.target.value)}
                >
                  {providerNamespaces.map((o) => (
                    <MenuItem key={o.id} value={o.name}>
                      <strong>{o.name}</strong> {o.description ? `(${o.description})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary">
                {`Não está vendo ${terms.yourOrganization}?`}{" "}
                <Link
                  href={
                    provider === 'gitlab'
                      ? 'https://gitlab.com/-/profile/applications'
                      : `https://github.com/settings/connections/applications/${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {`Conceder acesso ou gerenciar permissões no ${terms.providerName}`}
                </Link>
              </Typography>
            </Box>

            <Box display="flex" gap="1rem" alignItems="center" width="100%">
              <FormControl fullWidth size="medium" disabled={loadingProducts || products.length === 0}>
                <InputLabel id="product-select-label">
                  {loadingProducts ? "Carregando produtos..." : "Produtos do MeasureSoftGram"}
                </InputLabel>
                <Select
                  labelId="product-select-label"
                  value={selectedProductId}
                  label="Produtos do MeasureSoftGram"
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => router.push(`/products/create?id_organization=${selectedOrgDbId}`)}
                disabled={!selectedOrgDbId}
                sx={{ height: '56px', textTransform: 'none', fontWeight: 'bold', whiteSpace: 'nowrap', borderRadius: '8px' }}
              >
                Criar Produto
              </Button>
            </Box>
          </Paper>

          {selectedProductId ? (
            <Paper variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden' }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                padding="1rem"
                borderBottom="1px solid"
                borderColor="divider"
                flexWrap="wrap"
                gap="1rem"
              >
                <TextField
                  placeholder={`Buscar ${terms.repositories} do produto...`}
                  size="small"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{ minWidth: '250px' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={20} />
                      </InputAdornment>
                    )
                  }}
                />

                <Box display="flex" alignItems="center" gap="1rem">
                  <Tabs
                    value={tabValue}
                    onChange={(_, newValue) => setTabValue(newValue)}
                    indicatorColor="primary"
                    textColor="primary"
                    sx={{ marginRight: '1rem' }}
                  >
                    <Tab label="Importados" />
                    <Tab label="Todos" />
                    <Tab label="A Importar" />
                  </Tabs>
                </Box>
              </Box>

              {(() => {
                if (loadingRepos) {
                  return (
                    <Box display="flex" justifyContent="center" alignItems="center" padding="4rem">
                      <CircularProgress />
                    </Box>
                  );
                }
                if (repoFetchError === '409') {
                  return (
                    <Box padding="4rem" textAlign="center">
                      <Typography variant="h6" color="error" gutterBottom>
                        {`Token do ${terms.providerName} expirado ou inválido`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {`Para carregar os ${terms.repositories}, autorize o aplicativo novamente.`}
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={handleReauthorize}
                        sx={
                          provider === 'gitlab'
                            ? { backgroundColor: '#fc6d26', '&:hover': { backgroundColor: '#e24329' } }
                            : undefined
                        }
                        color={provider === 'gitlab' ? undefined : "primary"}
                      >
                        {`Autorizar ${terms.providerName}`}
                      </Button>
                    </Box>
                  );
                }
                if (repoFetchError === 'error') {
                  return (
                    <Box padding="4rem" textAlign="center">
                      <Typography variant="h6" color="error" gutterBottom>
                        {`Não foi possível carregar os ${terms.repositories}`}
                      </Typography>
                      <Button variant="outlined" color="primary" onClick={() => void handleSelectOrganization(selectedOrgName)}>
                        Tentar Novamente
                      </Button>
                    </Box>
                  );
                }
                return (
                  <List sx={{ padding: 0 }}>
                    {displayedRepos.length > 0 ? (
                      displayedRepos.map((repo) => {
                        const isAlreadyImported = importedRepoUrls.some(
                          url => url && repo.url && (url === repo.url || url.toLowerCase() === repo.url.toLowerCase())
                        );
                        return (
                          <ListItem
                            key={repo.gitlab_project_id || repo.github_repo_id}
                            sx={{
                              padding: '1.5rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              '&:last-child': { borderBottom: 'none' },
                              transition: 'background-color 0.2s',
                              '&:hover': {
                                backgroundColor: 'action.hover'
                              }
                            }}
                          >
                            <Box display="flex" flexDirection="column" gap="0.5rem" flexGrow={1}>
                              <Box display="flex" alignItems="center" gap="1rem">
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {repo.gitlab_path_with_namespace || repo.github_full_name || repo.name}
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">
                                {repo.description}
                              </Typography>
                            </Box>

                            <Box display="flex" alignItems="center" gap="1rem" marginLeft="2rem">
                              {isAlreadyImported ? (
                                <Chip
                                  icon={<CheckCircle color="success" />}
                                  label="Importado"
                                  variant="outlined"
                                  color="success"
                                  sx={{ fontWeight: '500', minWidth: '110px' }}
                                />
                              ) : (
                                <Button
                                  variant="contained"
                                  color="primary"
                                  startIcon={<AddCircle />}
                                  onClick={() => void handleImport(repo)}
                                  sx={{
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    minWidth: '110px',
                                    borderRadius: '8px'
                                  }}
                                >
                                  Importar
                                </Button>
                              )}
                            </Box>
                          </ListItem>
                        );
                      })
                    ) : (
                      <Box padding="3rem" textAlign="center">
                        <Typography variant="body1" color="text.secondary">
                          {`Nenhum ${terms.repository} associado a este produto foi encontrado.`}
                        </Typography>
                      </Box>
                    )}
                  </List>
                );
              })()}

              {!loadingRepos && (provider === 'gitlab' ? displayedRepos.length > 0 : filteredRepos.length > 0) && (
                <Box display="flex" justifyContent="center" padding="2rem">
                  <Pagination
                    count={provider === 'gitlab' ? gitlabTotalPages : Math.ceil(filteredRepos.length / itemsPerPage)}
                    page={page}
                    onChange={(e, value) => setPage(value)}
                    color="primary"
                  />
                </Box>
              )}
            </Paper>
          ) : (
            <Paper variant="outlined" sx={{ padding: '3rem', textAlign: 'center', borderRadius: '12px' }}>
              <FolderSpecial color="disabled" sx={{ fontSize: '3rem', marginBottom: '1rem' }} />
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {selectedOrgDbId && products.length === 0
                  ? `${terms.thisOrganization.charAt(0).toUpperCase()}${terms.thisOrganization.slice(1)} ainda não possui nenhum produto cadastrado.`
                  : `Selecione ${terms.anOrganization} e um produto para carregar os ${terms.repositories} correspondentes.`
                }
              </Typography>
              {selectedOrgDbId && products.length === 0 && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => router.push(`/products/create?id_organization=${selectedOrgDbId}`)}
                  sx={{ marginTop: '1.5rem', textTransform: 'none', fontWeight: 'bold', borderRadius: '8px' }}
                >
                  Cadastrar Primeiro Produto
                </Button>
              )}
            </Paper>
          )}
        </Box>
      </Container>
    </>
  );
};

Products.getLayout = getLayout;

export default Products;
