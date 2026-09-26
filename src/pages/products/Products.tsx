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
import { organizationQuery, GitHubOrganization, GitHubRepo } from "@services/organization";
import { useRouter } from "next/router";
import { productQuery } from "@services/product";
import { repository } from "@services/repository";
import { useOrganizationContext } from "@contexts/OrganizationProvider";
import { useProductContext } from "@contexts/ProductProvider";
import { useAuth } from "@contexts/Auth";

interface ProductType {
  id: string | number;
  name: string;
}

const Products: NextPageWithLayout = () => {
  useRequireAuth();
  const { t: tp } = useTranslation('product');
  const { t: to } = useTranslation('organization');
  const router = useRouter();

  const { organizationList, setCurrentOrganizations, fetchOrganizations, currentOrganization } = useOrganizationContext();
  const { setCurrentProduct, updateProductList, currentProduct } = useProductContext();
  const { signInWithGithub } = useAuth();

  const [gitHubOrgs, setGitHubOrgs] = useState<GitHubOrganization[]>([]);
  const [selectedOrgName, setSelectedOrgName] = useState<string>('');
  const [selectedOrgDbId, setSelectedOrgDbId] = useState<string>('');

  const [products, setProducts] = useState<ProductType[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  const [gitHubRepos, setGitHubRepos] = useState<GitHubRepo[]>([]);
  const [importedRepos, setImportedRepos] = useState<any[]>([]);
  const [importedRepoUrls, setImportedRepoUrls] = useState<string[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState<boolean>(true);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [loadingRepos, setLoadingRepos] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const [tabValue, setTabValue] = useState(0);

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setPage(1);
  }, [search, tabValue, gitHubRepos]);
  const lastLoadedProductIdRef = useRef<string>('');



  // eslint-disable-next-line sonarjs/cognitive-complexity
  const loadGitHubOrgs = async () => {
    setLoadingOrgs(true);
    try {
      const res = await organizationQuery.getGithubOrganizations();
      if (res.type === 'success') {
        setGitHubOrgs(res.value);
        if (res.value.length > 0) {
          let targetOrg = currentOrganization;
          if (!targetOrg) {
            const savedOrgId = localStorage.getItem('selectedOrgId');
            if (savedOrgId) {
              const parsedId = JSON.parse(savedOrgId);
              targetOrg = organizationList.find(o => String(o.id) === String(parsedId)) || null;
              if (!targetOrg) {
                try {
                  const orgRes = await organizationQuery.getOrganizationById(parsedId);
                  if (orgRes.type === 'success') {
                    targetOrg = orgRes.value as any;
                  }
                } catch (e) {
                  console.error(e);
                }
              }
            }
          }

          let defaultName = '';
          if (targetOrg) {
            const matchGo = res.value.find(go => {
              const ghName = go.github_org_name.toLowerCase();
              const dbName = targetOrg!.name.toLowerCase();
              const dbKey = targetOrg!.key ? targetOrg!.key.toLowerCase() : '';
              return ghName === dbName || 
                     (dbKey && ghName === dbKey) ||
                     (dbName.length > 3 && ghName.includes(dbName.replace(/[^a-z0-9]/g, '-'))) ||
                     (dbName.length > 3 && ghName.includes(dbName.replace(/[^a-z0-9]/g, '')));
            });
            if (matchGo) {
              defaultName = matchGo.github_org_name;
            }
          } else {
            defaultName = res.value[0].github_org_name;
          }
          
          setSelectedOrgName(defaultName);
        }
      } else {
        toast.error("Erro ao buscar organizações do GitHub.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar organizações.");
    } finally {
      setLoadingOrgs(false);
    }
  };

  const getBackendOrgId = async (orgName: string): Promise<string> => {
    const res = await organizationQuery.getAllOrganization();
    if (res.type !== 'success') return '';
    const ghName = orgName.toLowerCase();
    const match = res.value.find((o: any) => {
      const dbName = o.name.toLowerCase();
      const dbKey = o.key ? o.key.toLowerCase() : '';
      return dbName === ghName || 
             (dbKey && dbKey === ghName) ||
             (dbName.length > 3 && ghName.includes(dbName.replace(/[^a-z0-9]/g, '-'))) ||
             (dbName.length > 3 && ghName.includes(dbName.replace(/[^a-z0-9]/g, '')));
    });
    return match?.id || '';
  };

  const importOrg = async (orgName: string): Promise<string> => {
    const importResult = await organizationQuery.importOrganization(orgName);
    if (importResult.type === 'success' && importResult.value.id) {
      fetchOrganizations(true);
      return importResult.value.id;
    }
    return '';
  };

  const handleSelectOrganization = async (orgName: string) => {
    if (!orgName) return;
    setLoadingProducts(true);
    setLoadingRepos(true);
    setProducts([]);
    setGitHubRepos([]);
    setImportedRepoUrls([]);
    setImportedRepos([]);
    try {
      let orgDbId = await getBackendOrgId(orgName);

      if (!orgDbId) {
        orgDbId = await importOrg(orgName);
        if (!orgDbId) {
          toast.error(`Erro ao importar organização no MeasureSoftGram.`);
          setLoadingProducts(false);
          setLoadingRepos(false);
          return;
        }
      }

      setSelectedOrgDbId(orgDbId);

      // 3. Load products for this database organization ID
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

      // 4. Load available GitHub repositories for this organization
      const reposRes = await organizationQuery.getGithubRepos(orgDbId);
      if (reposRes.type === 'success') {
        setGitHubRepos(reposRes.value);
      } else {
        toast.error(`Erro ao buscar repositórios do GitHub.`);
      }

    } catch (error: any) {
      console.error(error);
      toast.error(`Erro de comunicação com o servidor.`);
    } finally {
      setLoadingProducts(false);
      setLoadingRepos(false);
    }
  };

  const loadProductRepositories = async (orgDbId: string, productId: string) => {
    if (!orgDbId || !productId) return;
    try {
      const res = await productQuery.getAllRepositories(orgDbId, productId);
      const repoList = res?.data?.results || res?.data || [];
      setImportedRepos(repoList);
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
      console.error("Erro ao carregar repositórios importados:", error);
    }
  };

  const handleImport = async (repo: GitHubRepo) => {
    if (!selectedOrgDbId || !selectedProductId) return;
    try {
      const response = await repository.createRepository(selectedOrgDbId, selectedProductId, {
        name: repo.name,
        url: repo.url,
        description: repo.description || '',
        platform: 'github',
        imported: true
      });
      if (response.type === 'success') {
        toast.success(`Repositório ${repo.name} importado com sucesso!`);
        loadProductRepositories(selectedOrgDbId, selectedProductId);
      } else {
        toast.error(`Erro ao importar repositório: ${response.error.message || 'Erro desconhecido'}`);
      }
    } catch (error: any) {
      toast.error(`Erro ao importar repositório: ${error.message || 'Erro desconhecido'}`);
    }
  };

  useEffect(() => {
    loadGitHubOrgs();
  }, []);

  useEffect(() => {
    const code = router.query.code as string;
    if (code) {
      const exchangeCode = async () => {
        setLoadingOrgs(true);
        try {
          const res = await signInWithGithub(code);
          if (res.type === 'success') {
            toast.success("Organizações do GitHub vinculadas com sucesso!");
            await loadGitHubOrgs();
            fetchOrganizations(true);
          } else {
            toast.error("Erro ao vincular organizações do GitHub.");
          }
        } catch (err) {
          console.error(err);
          toast.error("Ocorreu um erro ao vincular.");
        } finally {
          setLoadingOrgs(false);
          const { code: _, ...query } = router.query;
          router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
        }
      };
      exchangeCode();
    }
  }, [router.query.code]);



  useEffect(() => {
    if (selectedOrgName) {
      handleSelectOrganization(selectedOrgName);
    }
  }, [selectedOrgName]);

  // eslint-disable-next-line sonarjs/cognitive-complexity
  useEffect(() => {
    if (currentOrganization && gitHubOrgs.length > 0) {
      const matchGo = gitHubOrgs.find(go => {
        const ghName = go.github_org_name.toLowerCase();
        const dbName = currentOrganization.name.toLowerCase();
        const dbKey = currentOrganization.key ? currentOrganization.key.toLowerCase() : '';
        
        return ghName === dbName || 
               (dbKey && ghName === dbKey) ||
               (dbName.length > 3 && ghName.includes(dbName.replace(/[^a-z0-9]/g, '-'))) ||
               (dbName.length > 3 && ghName.includes(dbName.replace(/[^a-z0-9]/g, '')));
      });
      if (matchGo) {
        if (matchGo.github_org_name !== selectedOrgName) {
          setSelectedOrgName(matchGo.github_org_name);
        }
      } else if (selectedOrgName !== '') {
        setSelectedOrgName('');
        setProducts([]);
        setGitHubRepos([]);
        setImportedRepoUrls([]);
        setImportedRepos([]);
        setSelectedProductId('');
      }
    }
  }, [currentOrganization, gitHubOrgs]);

  useEffect(() => {
    if (selectedOrgDbId && selectedProductId) {
      loadProductRepositories(selectedOrgDbId, selectedProductId);
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
          url => url === repo.url || url.toLowerCase() === repo.url.toLowerCase()
        );
        const matchesSearch = repo.name.toLowerCase().includes(search.toLowerCase());
        const matchesTab =
          (tabValue === 0 && isAlreadyImported) || tabValue === 1 || (tabValue === 2 && !isAlreadyImported);
        return matchesSearch && matchesTab;
      }),
    [gitHubRepos, importedRepoUrls, search, tabValue]
  );



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
                Importação de Repositórios
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Selecione sua organização e o produto correspondente para gerenciar seus repositórios.
              </Typography>
            </Box>
            <GitHub color="action" sx={{ fontSize: '2.5rem' }} />
          </Box>

          <Paper variant="outlined" sx={{ padding: '1.5rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Box display="flex" flexDirection="column" gap="0.5rem">
              <FormControl fullWidth size="medium" disabled={loadingOrgs}>
                <InputLabel id="org-select-label">
                  {loadingOrgs ? "Carregando organizações..." : "Organizações do GitHub"}
                </InputLabel>
                <Select
                  labelId="org-select-label"
                  value={selectedOrgName}
                  label="Organizações do GitHub"
                  onChange={(e) => setSelectedOrgName(e.target.value)}
                >
                  {gitHubOrgs.map((o) => (
                    <MenuItem key={o.github_org_id} value={o.github_org_name}>
                      <strong>{o.github_org_name}</strong> {o.description ? `(${o.description})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary">
                Não está vendo sua organização?{" "}
                <Link
                  href={`https://github.com/settings/connections/applications/${process.env.GITHUB_CLIENT_ID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Conceder acesso ou gerenciar permissões no GitHub
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
                  placeholder="Buscar repositórios do produto..."
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

              {loadingRepos ? (
                <Box display="flex" justifyContent="center" alignItems="center" padding="4rem">
                  <CircularProgress />
                </Box>
              ) : (
                <List sx={{ padding: 0 }}>
                  {filteredRepos.length > 0 ? (
                    filteredRepos.slice((page - 1) * itemsPerPage, page * itemsPerPage).map((repo) => {
                      const isAlreadyImported = importedRepoUrls.some(
                        url => url === repo.url || url.toLowerCase() === repo.url.toLowerCase()
                      );
                      return (
                        <ListItem
                          key={repo.github_repo_id}
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
                                {repo.github_full_name || repo.name}
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
                                onClick={() => handleImport(repo)}
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
                        Nenhum repositório associado a este produto foi encontrado.
                      </Typography>
                    </Box>
                  )}
                </List>
              )}

              {!loadingRepos && filteredRepos.length > 0 && (
                <Box display="flex" justifyContent="center" padding="2rem">
                  <Pagination
                    count={Math.ceil(filteredRepos.length / itemsPerPage)}
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
                  ? "Esta organização ainda não possui nenhum produto cadastrado."
                  : "Selecione uma organização e um produto para carregar os repositórios correspondentes."
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
