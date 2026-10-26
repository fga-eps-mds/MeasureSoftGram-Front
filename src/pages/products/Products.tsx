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
  Button,
  Paper,
  InputAdornment,
  CircularProgress,
  LinearProgress,
  Link,
  Pagination
} from "@mui/material";
import { Search, GitHub, FolderSpecial } from "@mui/icons-material";
import { NextPageWithLayout } from "@pages/_app.next";
import getLayout from "@components/Layout";
import useRequireAuth from "@hooks/useRequireAuth";
import { toast } from "react-toastify";
import { organizationQuery, Result, ResultError } from "@services/organization";
import type { AxiosError } from 'axios';
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
import { useAuth } from '@contexts/Auth';
import {
  UnifiedRepoItem,
  normalizeRepoUrl,
  refreshProviderRepos,
  useImportList
} from './hooks/useImportRepos';
import ImportRepoList from './components/ImportRepoList';
import ReauthorizePanel from './components/ReauthorizePanel';

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

const Products: NextPageWithLayout = () => {
  const { terms, provider } = useProviderTerms();
  const { isProviderReady } = useAuth();
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

  // importados nesta tela (chave "organização:produto|url"): marcam o "Importado" na hora, antes de a lista do
  // servidor voltar, sem passar para outro produto ou organização
  const [pendingImports, setPendingImports] = useState<Set<string>>(new Set());
  const [loadingOrgs, setLoadingOrgs] = useState<boolean>(true);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [repoFetchError, setRepoFetchError] = useState<'409' | 'error' | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [tabValue, setTabValue] = useState(0);

  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [search, tabValue, selectedOrgName, provider, selectedProductId]);

  // a busca vai para o servidor só quando a pessoa para de digitar
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [search]);

  const lastLoadedProductIdRef = useRef<string>('');

  const currentNamespace = useMemo(
    () => providerNamespaces.find(ns => ns.name === selectedOrgName || ns.full_path === selectedOrgName),
    [providerNamespaces, selectedOrgName]
  );

  const importList = useImportList({
    provider: provider === 'gitlab' ? 'gitlab' : 'github',
    terms,
    orgDbId: selectedOrgDbId,
    productId: selectedProductId,
    namespace: currentNamespace,
    tabValue,
    page,
    search: debouncedSearch
  });
  const { imported } = importList;
  const mutateImported = imported.mutate;

  // ao trocar de produto, abre em "Importados" se ele já tem repositórios e em "A Importar" se não tem
  useEffect(() => {
    if (!selectedProductId || imported.repos === undefined) return;
    if (lastLoadedProductIdRef.current === selectedProductId) return;
    lastLoadedProductIdRef.current = selectedProductId;
    setTabValue(imported.repos.length === 0 ? 2 : 0);
  }, [selectedProductId, imported.repos]);

  const importScope = `${selectedOrgDbId}:${selectedProductId}`;
  const importedUrls = useMemo(
    () => new Set((imported.repos ?? []).map(repo => normalizeRepoUrl(repo.url))),
    [imported.repos]
  );
  const isImported = (repo: UnifiedRepoItem) =>
    !!repo.url && (importedUrls.has(normalizeRepoUrl(repo.url)) ||
      pendingImports.has(`${importScope}|${normalizeRepoUrl(repo.url)}`));

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

  // Busca as organizações/namespaces do provedor e converte para o formato único da tela.
  const fetchProviderNamespaces = async (): Promise<Result<ProviderNamespaceItem[]>> => {
    if (provider === 'gitlab') {
      const res = await organizationQuery.getGitLabNamespaces();
      if (res.type !== 'success') return res;
      return {
        type: 'success',
        value: res.value.map(ns => ({
          id: ns.id,
          name: ns.name,
          full_path: ns.full_path,
          description: ns.description,
          avatar_url: ns.avatar_url,
          kind: ns.kind,
          github_org_id: ns.id,
          github_org_name: ns.name
        }))
      };
    }
    // 'github' e 'credentials' (admin com token do GitHub) usam o GitHub, padrão da plataforma.
    const res = await organizationQuery.getGithubOrganizations();
    if (res.type !== 'success') return res;
    return {
      type: 'success',
      value: res.value.map(go => ({
        id: go.github_org_id,
        name: go.github_org_name,
        description: go.description,
        avatar_url: go.avatar_url,
        github_org_id: go.github_org_id,
        github_org_name: go.github_org_name
      }))
    };
  };

  // 409 = token do provedor expirado/revogado: mostra a reautorização sem deslogar.
  const notifyNamespacesError = (error: ResultError['error']) => {
    if ((error as AxiosError)?.response?.status === 409) {
      setRepoFetchError('409');
      toast.error(`Token do ${terms.providerName} expirado ou inválido.`);
      return;
    }
    toast.error(`Erro ao buscar ${terms.organizations} do ${terms.providerName}.`);
  };

  const loadProviderNamespaces = async (estaAtivo: () => boolean = () => true) => {
    setLoadingOrgs(true);
    setRepoFetchError(null);
    try {
      const res = await fetchProviderNamespaces();
      if (!estaAtivo()) return;
      if (res.type !== 'success') {
        notifyNamespacesError(res.error);
        return;
      }

      setProviderNamespaces(res.value);
      if (res.value.length === 0) return;
      const defaultName = await resolveDefaultOrgName(res.value);
      if (!estaAtivo()) return;
      setSelectedOrgName(defaultName);
    } catch (error) {
      if (!estaAtivo()) return;
      console.error(error);
      toast.error(`Erro ao carregar ${terms.organizations}.`);
    } finally {
      if (estaAtivo()) setLoadingOrgs(false);
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

  // grupo do GitLab: uma Organization compartilhada entre os membros do grupo
  const importGitlabGroupOrg = async (groupId: number | string): Promise<string> => {
    const importRes = await organizationQuery.importGitlabGroup(groupId);
    if (importRes.type !== 'success' || !importRes.value?.id) return '';
    await fetchOrganizations();
    return String(importRes.value.id);
  };

  // espaço pessoal do GitLab: uma Organization própria, ou a que já existe com o mesmo nome
  const importGitlabPersonalOrg = async (orgName: string): Promise<string> => {
    const createRes = await organizationQuery.createOrganization({ name: orgName });
    if (createRes.type === 'success' && createRes.value?.id) {
      await fetchOrganizations();
      return String(createRes.value.id);
    }
    const res = await organizationQuery.getAllOrganization();
    if (res.type !== 'success') return '';
    const found = res.value.find((o: any) => o.name?.toLowerCase() === orgName.toLowerCase());
    return found?.id ? String(found.id) : '';
  };

  const importGithubOrg = async (orgName: string): Promise<string> => {
    const importResult = await organizationQuery.importOrganization(orgName);
    if (importResult.type !== 'success' || !importResult.value.id) return '';
    await fetchOrganizations();
    return importResult.value.id;
  };

  const importOrg = async (orgName: string): Promise<string> => {
    if (provider !== 'gitlab') return importGithubOrg(orgName);
    const group = providerNamespaces.find(
      ns => ns.kind === 'group' && (ns.name === orgName || ns.full_path === orgName)
    );
    return group ? importGitlabGroupOrg(group.id) : importGitlabPersonalOrg(orgName);
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

  const handleSelectOrganization = async (orgName: string) => {
    if (!orgName) return;
    if (handleSelectOrgRef.current) return;
    handleSelectOrgRef.current = true;
    setLoadingProducts(true);
    setProducts([]);
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
    } catch (error: any) {
      console.error(error);
      toast.error(`Erro de comunicação com o servidor.`);
    } finally {
      setLoadingProducts(false);
      handleSelectOrgRef.current = false;
    }
  };

  const handleImport = async (repo: UnifiedRepoItem) => {
    // a seleção pode mudar durante o await: tudo abaixo usa a seleção em que o clique aconteceu
    const orgDbId = selectedOrgDbId;
    const productId = selectedProductId;
    if (!orgDbId || !productId) return;
    try {
      const response = await repository.createRepository(orgDbId, productId, {
        name: repo.name,
        url: repo.url,
        description: repo.description || '',
        platform: provider === 'gitlab' ? 'gitlab' : 'github',
        imported: true
      });
      if (response.type === 'success') {
        toast.success(`${terms.Repository} ${repo.name} importado com sucesso!`);
        setPendingImports(prev => new Set(prev).add(`${orgDbId}:${productId}|${normalizeRepoUrl(repo.url)}`));
        void mutateImported();
        // "A Importar" e "Todos" mudam com o repositório importado
        void refreshProviderRepos();
        // a lista guardada para as outras telas do produto também passa a ter o repositório importado
        void refreshRepositoryList(orgDbId, productId);
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

  // Só busca depois de o provider real ser lido do localStorage; antes disso ele
  // vale 'credentials' provisoriamente e geraria uma busca (e um toast) a mais.
  useEffect(() => {
    if (!isProviderReady) return;
    let ativo = true;
    void loadProviderNamespaces(() => ativo);
    return () => { ativo = false; };
  }, [provider, isProviderReady]);

  useEffect(() => {
    if (selectedOrgName) {
      void handleSelectOrganization(selectedOrgName);
    }
  }, [selectedOrgName]);

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
        setSelectedProductId('');
      }
    }
  }, [currentOrganization, providerNamespaces]);

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

  const renderListBody = () => {
    if (importList.isLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" padding="4rem">
          <CircularProgress />
        </Box>
      );
    }
    if (importList.errorKind === '409') {
      return <ReauthorizePanel embedded terms={terms} isGitlab={provider === 'gitlab'} onReauthorize={handleReauthorize} />;
    }
    if (importList.errorKind === 'error') {
      return (
        <Box padding="4rem" textAlign="center">
          <Typography variant="h6" color="error" gutterBottom>
            {`Não foi possível carregar os ${terms.repositories}`}
          </Typography>
          <Button variant="outlined" color="primary" onClick={importList.retry}>
            Tentar Novamente
          </Button>
        </Box>
      );
    }
    return (
      <ImportRepoList
        repos={importList.repos}
        terms={terms}
        isImported={isImported}
        onImport={repo => void handleImport(repo)}
        importDisabled={!importList.importedReady}
      />
    );
  };

  const renderEmptySelection = () => (
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
  );

  const renderContent = () => {
    if (repoFetchError === '409') {
      return <ReauthorizePanel terms={terms} isGitlab={provider === 'gitlab'} onReauthorize={handleReauthorize} />;
    }
    if (!selectedProductId) return renderEmptySelection();
    return (
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

        {importList.isRefreshing && <LinearProgress />}
        {renderListBody()}

        {!importList.isLoading && !importList.errorKind && importList.repos.length > 0 && (
          <Box display="flex" justifyContent="center" padding="2rem">
            <Pagination
              count={importList.totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Paper>
    );
  };

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

          {renderContent()}
        </Box>
      </Container>
    </>
  );
};

Products.getLayout = getLayout;

export default Products;
