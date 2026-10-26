import React from 'react';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import { organizationQuery } from '@services/organization';
import { productQuery } from '@services/product';
import { repository } from '@services/repository';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useProductContext } from '@contexts/ProductProvider';
import { useAuth } from '@contexts/Auth';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { OAUTH_STATE_KEY } from '@services/Auth/oauthState';
import { SWRConfig } from 'swr';
import Products from '../Products';
import { normalizeRepoUrl } from '../hooks/useImportRepos';

jest.mock('@services/organization');
jest.mock('@services/product');
jest.mock('@services/repository');
jest.mock('@contexts/OrganizationProvider');
jest.mock('@contexts/ProductProvider');
jest.mock('@contexts/Auth');
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));
jest.mock('react-toastify', () => ({
  toast: { error: jest.fn(), success: jest.fn() }
}));

// cada teste com um cache do SWR novo, para uma resposta não vazar para o seguinte
const withSWR = (ui: React.ReactElement) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0, shouldRetryOnError: false }}>{ui}</SWRConfig>
);
const renderProducts = () => render(withSWR(<Products />));

const mockFetchOrgs = jest.fn();
const mockSetCurrentOrgs = jest.fn();
const mockUpdateProductList = jest.fn();
const mockSetCurrentProduct = jest.fn();
const mockSignInWithGithub = jest.fn();
const mockPush = jest.fn();
const mockReplace = jest.fn();

describe('Products Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    (useRouter as jest.Mock).mockReturnValue({ query: {}, push: mockPush, replace: mockReplace });
    (useAuth as jest.Mock).mockReturnValue({
      provider: 'github',
      isProviderReady: true,
      signInWithGithub: mockSignInWithGithub
    });
    
    (useOrganizationContext as jest.Mock).mockReturnValue({
      organizationList: [{ id: 'org-1', name: 'Org 1', key: 'org-1' }],
      currentOrganization: { id: 'org-1', name: 'Org 1', key: 'org-1' },
      setCurrentOrganizations: mockSetCurrentOrgs,
      fetchOrganizations: mockFetchOrgs
    });
    
    (useProductContext as jest.Mock).mockReturnValue({
      currentProduct: { id: 'prod-1', name: 'Prod 1' },
      updateProductList: mockUpdateProductList,
      setCurrentProduct: mockSetCurrentProduct
    });

    (organizationQuery.getGithubOrganizations as jest.Mock).mockResolvedValue({
      type: 'success',
      value: [{ github_org_id: 1, github_org_name: 'Org 1', description: 'Desc' }]
    });

    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({
      type: 'success',
      value: [{ id: 'org-1', name: 'Org 1', key: 'org-1' }]
    });

    (productQuery.getAllProducts as jest.Mock).mockResolvedValue({
      data: { results: [{ id: 'prod-1', name: 'Prod 1' }] }
    });

    (organizationQuery.getGithubRepos as jest.Mock).mockResolvedValue({
      type: 'success',
      value: {
        repos: [{ github_repo_id: 1, name: 'Repo 1', url: 'http://repo1', description: '' }],
        totalPages: 1,
        nextPage: null
      }
    });

    (productQuery.getAllRepositories as jest.Mock).mockResolvedValue({
      data: { results: [] }
    });
  });

  it('renders and loads initial data', async () => {
    renderProducts();
    
    await waitFor(() => {
      expect(organizationQuery.getGithubOrganizations).toHaveBeenCalled();
    });
    
    expect(await screen.findByText('Org 1')).toBeInTheDocument();
  });

  it('does not exchange a code received in the URL', async () => {
    (useRouter as jest.Mock).mockReturnValue({ query: { code: '123' }, push: mockPush, replace: mockReplace });

    renderProducts();

    await waitFor(() => {
      expect(organizationQuery.getGithubOrganizations).toHaveBeenCalled();
    });
    expect(mockSignInWithGithub).not.toHaveBeenCalled();
  });

  it('handles github org selection, imports and lists repos', async () => {
    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValueOnce({
      type: 'success',
      value: [] // Simulate not in backend
    }).mockResolvedValueOnce({
      type: 'success',
      value: [{ id: 'org-1', name: 'Org 1' }] // After import
    });

    (organizationQuery.importOrganization as jest.Mock).mockResolvedValueOnce({
      type: 'success',
      value: { id: 'org-1' }
    });

    renderProducts();

    await waitFor(() => {
      expect(organizationQuery.importOrganization).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Repo 1')).toBeInTheDocument();
    });
  });

  it('handles importing a repo successfully', async () => {
    (repository.createRepository as jest.Mock).mockResolvedValueOnce({ type: 'success' });
    
    renderProducts();

    await waitFor(() => {
      expect(screen.getByText('Repo 1')).toBeInTheDocument();
    });

    const importBtn = screen.getByText('Importar');
    await act(async () => { fireEvent.click(importBtn); });

    await waitFor(() => {
      expect(repository.createRepository).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Repositório Repo 1 importado com sucesso!');
    });
    expect(toast.error).not.toHaveBeenCalled();
  });
  
  it('handles importing a repo with error', async () => {
    (repository.createRepository as jest.Mock).mockResolvedValueOnce({ type: 'error', error: { message: 'Erro teste' } });
    
    renderProducts();

    await waitFor(() => {
      expect(screen.getByText('Repo 1')).toBeInTheDocument();
    });

    const importBtn = screen.getByText('Importar');
    await act(async () => { fireEvent.click(importBtn); });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao importar repositório: Erro teste');
    });
  });

  it('can change tabs, search and paginate on the server', async () => {
    const makeRepos = (from: number, to: number) =>
      Array.from({ length: to - from }).map((_, i) => ({
        github_repo_id: from + i,
        name: `Repo ${from + i}`,
        url: `http://repo${from + i}`,
        description: ''
      }));
    (organizationQuery.getGithubRepos as jest.Mock).mockImplementation(async (_org: string, page: number) => ({
      type: 'success',
      value: {
        repos: page === 2 ? makeRepos(10, 15) : makeRepos(0, 10),
        totalPages: 2,
        nextPage: page === 2 ? null : 2
      }
    }));

    renderProducts();

    await waitFor(() => {
      expect(screen.getByText('Repo 0')).toBeInTheDocument();
    });
    expect(screen.queryByText('Repo 10')).not.toBeInTheDocument();

    await act(async () => { fireEvent.click(screen.getByText('Todos')); });

    const page2Button = await screen.findByText('2');
    await act(async () => { fireEvent.click(page2Button); });

    await waitFor(() => {
      expect(organizationQuery.getGithubRepos).toHaveBeenLastCalledWith(expect.anything(), 2, '');
      expect(screen.getByText('Repo 12')).toBeInTheDocument();
    });
    expect(screen.queryByText('Repo 0')).not.toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText('Buscar repositórios do produto...');
    await act(async () => { fireEvent.change(searchInput, { target: { value: 'Repo 10' } }); });

    await waitFor(() => {
      expect(organizationQuery.getGithubRepos).toHaveBeenLastCalledWith(expect.anything(), 1, 'Repo 10');
    });
  });

  describe('abas da importação', () => {
    const productRepos = (count: number) =>
      Array.from({ length: count }).map((_, i) => ({
        id: i + 1,
        name: `Importado ${i + 1}`,
        url: `https://github.com/org-1/importado-${i + 1}`,
        description: ''
      }));

    it('lista os importados do produto, mesmo os que não estão na página do provedor, de 10 em 10', async () => {
      (productQuery.getAllRepositories as jest.Mock).mockResolvedValue({ data: { results: productRepos(12) } });

      renderProducts();

      expect(await screen.findByText('org-1/importado-1')).toBeInTheDocument();
      expect(screen.getByText('org-1/importado-10')).toBeInTheDocument();
      expect(screen.queryByText('org-1/importado-11')).not.toBeInTheDocument();
      // a aba "Importados" não depende da lista do provedor
      expect(organizationQuery.getGithubRepos).not.toHaveBeenCalled();

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Go to page 2' }));
      });

      expect(await screen.findByText('org-1/importado-12')).toBeInTheDocument();
      expect(screen.queryByText('org-1/importado-1')).not.toBeInTheDocument();
    });

    it('pede ao servidor a aba "A Importar" sem os repositórios do produto', async () => {
      (productQuery.getAllRepositories as jest.Mock).mockResolvedValue({ data: { results: productRepos(1) } });

      renderProducts();
      expect(await screen.findByText('org-1/importado-1')).toBeInTheDocument();

      await act(async () => { fireEvent.click(screen.getByText('A Importar')); });

      await waitFor(() => {
        expect(organizationQuery.getGithubRepos).toHaveBeenLastCalledWith('org-1', 1, '', 'prod-1');
      });
      expect(await screen.findByText('Repo 1')).toBeInTheDocument();
    });

    it('mostra o repositório em "Importados" depois de importar', async () => {
      (repository.createRepository as jest.Mock).mockResolvedValueOnce({ type: 'success' });
      (productQuery.getAllRepositories as jest.Mock)
        .mockResolvedValueOnce({ data: { results: [] } })
        .mockResolvedValue({ data: { results: [{ id: 1, name: 'Repo 1', url: 'http://repo1', description: '' }] } });

      renderProducts();

      fireEvent.click(await screen.findByText('Importar'));
      expect(await screen.findByText('Importado')).toBeInTheDocument();

      await act(async () => { fireEvent.click(screen.getByText('Importados')); });

      expect(await screen.findByText('Repo 1')).toBeInTheDocument();
      expect(productQuery.getAllRepositories).toHaveBeenCalledTimes(2);
    });
  });

  describe('troca de produto e de organização', () => {
    const selectOption = async (label: string, option: string) => {
      await act(async () => { fireEvent.mouseDown(screen.getByLabelText(label)); });
      await act(async () => { fireEvent.click(await screen.findByRole('option', { name: new RegExp(option) })); });
    };

    it('não marca como importado no outro produto o repositório importado no anterior', async () => {
      // sem produto no contexto, para a seleção da tela não voltar para o produto antigo
      (useProductContext as jest.Mock).mockReturnValue({
        currentProduct: undefined,
        updateProductList: mockUpdateProductList,
        setCurrentProduct: mockSetCurrentProduct
      });
      (productQuery.getAllProducts as jest.Mock).mockResolvedValue({
        data: { results: [{ id: 'prod-1', name: 'Prod 1' }, { id: 'prod-2', name: 'Prod 2' }] }
      });
      (repository.createRepository as jest.Mock).mockResolvedValueOnce({ type: 'success' });
      (productQuery.getAllRepositories as jest.Mock).mockImplementation(async (_org: string, productId: string) => ({
        data: {
          results: productId === 'prod-1' && (repository.createRepository as jest.Mock).mock.calls.length > 0
            ? [{ id: 1, name: 'Repo 1', url: 'http://repo1', description: '' }]
            : []
        }
      }));

      renderProducts();

      fireEvent.click(await screen.findByText('Importar'));
      expect(await screen.findByText('Importado')).toBeInTheDocument();

      await selectOption('Produtos do MeasureSoftGram', 'Prod 2');

      expect(await screen.findByText('Importar')).toBeInTheDocument();
      expect(screen.queryByText('Importado')).not.toBeInTheDocument();
    });

    it('não mostra nem deixa importar os repositórios da organização anterior enquanto a nova carrega', async () => {
      (organizationQuery.getGithubOrganizations as jest.Mock).mockResolvedValue({
        type: 'success',
        value: [
          { github_org_id: 1, github_org_name: 'Org 1', description: '' },
          { github_org_id: 2, github_org_name: 'Org 2', description: '' }
        ]
      });
      (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({
        type: 'success',
        value: [{ id: 'org-1', name: 'Org 1', key: 'org-1' }, { id: 'org-2', name: 'Org 2', key: 'org-2' }]
      });
      (useOrganizationContext as jest.Mock).mockReturnValue({
        organizationList: [{ id: 'org-1', name: 'Org 1', key: 'org-1' }, { id: 'org-2', name: 'Org 2', key: 'org-2' }],
        currentOrganization: undefined,
        setCurrentOrganizations: mockSetCurrentOrgs,
        fetchOrganizations: mockFetchOrgs
      });
      let releaseOrg2: () => void = () => undefined;
      (organizationQuery.getGithubRepos as jest.Mock).mockImplementation((orgId: string) => {
        if (orgId !== 'org-2') {
          return Promise.resolve({
            type: 'success',
            value: { repos: [{ github_repo_id: 1, name: 'Repo da Org 1', url: 'http://org1/repo', description: '' }], totalPages: 1, nextPage: null }
          });
        }
        return new Promise(resolve => {
          releaseOrg2 = () => {
            resolve({
              type: 'success',
              value: { repos: [{ github_repo_id: 2, name: 'Repo da Org 2', url: 'http://org2/repo', description: '' }], totalPages: 1, nextPage: null }
            });
          };
        });
      });

      renderProducts();
      expect(await screen.findByText('Repo da Org 1')).toBeInTheDocument();

      await selectOption('Organizações do GitHub', 'Org 2');

      await waitFor(() => expect(screen.queryByText('Repo da Org 1')).not.toBeInTheDocument());
      expect(screen.queryByText('Importar')).not.toBeInTheDocument();

      await act(async () => { releaseOrg2(); });
      expect(await screen.findByText('Repo da Org 2')).toBeInTheDocument();
    });
  });

  describe('normalizeRepoUrl', () => {
    it('tira espaços, barras finais e maiúsculas', () => {
      expect(normalizeRepoUrl('  https://GitHub.com/Org/Repo///  ')).toBe('https://github.com/org/repo');
      expect(normalizeRepoUrl('/////')).toBe('');
      expect(normalizeRepoUrl(null)).toBe('');
    });
  });

  it('handles empty products list', async () => {
    (productQuery.getAllProducts as jest.Mock).mockResolvedValue({
      data: { results: [] }
    });

    renderProducts();

    await waitFor(() => {
      expect(screen.getByText('Esta organização ainda não possui nenhum produto cadastrado.')).toBeInTheDocument();
    });
    
    const createBtn = screen.getByText('Cadastrar Primeiro Produto');
    await act(async () => { fireEvent.click(createBtn); });
    expect(mockPush).toHaveBeenCalledWith('/products/create?id_organization=org-1');
  });

  it('handles getGithubOrganizations error', async () => {
    (organizationQuery.getGithubOrganizations as jest.Mock).mockResolvedValue({
      type: 'error'
    });

    renderProducts();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao buscar organizações do GitHub.');
    });
  });

  it('handles getGithubOrganizations 409 error displaying reauthorize button without logging out', async () => {
    (organizationQuery.getGithubOrganizations as jest.Mock).mockResolvedValue({
      type: 'error',
      error: { response: { status: 409 } }
    });

    renderProducts();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Token do GitHub expirado ou inválido.');
    });
    expect(await screen.findByText('Token do GitHub expirado ou inválido')).toBeInTheDocument();
    expect(await screen.findByText('Autorizar GitHub')).toBeInTheDocument();
  });

  it('handles loadGitHubOrgs exception', async () => {
    (organizationQuery.getGithubOrganizations as jest.Mock).mockRejectedValue(new Error('Network error'));

    renderProducts();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar organizações.');
    });
  });
  
  it('loads org from local storage if current is undefined', async () => {
    (useOrganizationContext as jest.Mock).mockReturnValue({
      organizationList: [{ id: 'org-2', name: 'Org 2', key: 'org-2' }],
      currentOrganization: undefined,
      setCurrentOrganizations: mockSetCurrentOrgs,
      fetchOrganizations: mockFetchOrgs
    });
    
    localStorage.setItem('selectedOrgId', '"org-2"');
    
    (organizationQuery.getGithubOrganizations as jest.Mock).mockResolvedValue({
      type: 'success',
      value: [{ github_org_id: 2, github_org_name: 'Org 2', description: 'Desc' }]
    });

    renderProducts();

    await waitFor(() => {
      expect(organizationQuery.getGithubOrganizations).toHaveBeenCalled();
    });
    expect(await screen.findByText('Org 2')).toBeInTheDocument();
  });
  
  it('fetches org if local storage id not in list', async () => {
    (useOrganizationContext as jest.Mock).mockReturnValue({
      organizationList: [],
      currentOrganization: undefined,
      setCurrentOrganizations: mockSetCurrentOrgs,
      fetchOrganizations: mockFetchOrgs
    });
    
    localStorage.setItem('selectedOrgId', '"org-3"');
    
    (organizationQuery.getOrganizationById as jest.Mock).mockResolvedValue({
      type: 'success',
      value: { id: 'org-3', name: 'Org 3', key: 'org-3' }
    });
    
    (organizationQuery.getGithubOrganizations as jest.Mock).mockResolvedValue({
      type: 'success',
      value: [{ github_org_id: 3, github_org_name: 'Org 3', description: 'Desc' }]
    });

    renderProducts();

    await waitFor(() => {
      expect(organizationQuery.getOrganizationById).toHaveBeenCalledWith('org-3');
    });
    expect(await screen.findByText('Org 3')).toBeInTheDocument();
  });

  it('handles github repos fetch 409 error correctly', async () => {
    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValueOnce({
      type: 'success',
      value: [{ id: 'org-1', name: 'Org 1', key: 'org-1', github_org_name: 'org-1' }]
    });

    (organizationQuery.getGithubRepos as jest.Mock).mockResolvedValueOnce({
      type: 'error',
      error: { response: { status: 409 } }
    });

    renderProducts();

    await waitFor(() => {
      expect(screen.getByText('Token do GitHub expirado ou inválido')).toBeInTheDocument();
      expect(screen.getByText('Autorizar GitHub')).toBeInTheDocument();
    });
  });

  describe('reautorização do GitHub', () => {
    const originalLocation = window.location;

    beforeEach(() => {
      sessionStorage.clear();
      delete (window as any).location;
      window.location = { ...originalLocation, assign: jest.fn() } as any;
    });

    afterEach(() => {
      window.location = originalLocation;
      jest.restoreAllMocks();
    });

    it('volta para Produtos pelo fluxo com state e com os escopos do login', async () => {
      (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValueOnce({
        type: 'success',
        value: [{ id: 'org-1', name: 'Org 1', key: 'org-1', github_org_name: 'org-1' }]
      });
      (organizationQuery.getGithubRepos as jest.Mock).mockResolvedValueOnce({
        type: 'error',
        error: { response: { status: 409 } }
      });

      renderProducts();
      fireEvent.click(await screen.findByText('Autorizar GitHub'));

      const stored = JSON.parse(sessionStorage.getItem(OAUTH_STATE_KEY) as string);
      const url = new URL((window.location.assign as jest.Mock).mock.calls[0][0]);
      expect(stored).toMatchObject({ provider: 'github', returnTo: '/products' });
      expect(url.origin + url.pathname).toBe('https://github.com/login/oauth/authorize');
      expect(url.searchParams.get('state')).toBe(stored.nonce);
      expect(url.searchParams.get('scope')).toBe('repo read:org user');
      expect(url.searchParams.has('redirect_uri')).toBe(true);
    });

    it('avisa e não sai do site quando não consegue guardar o state', async () => {
      (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValueOnce({
        type: 'success',
        value: [{ id: 'org-1', name: 'Org 1', key: 'org-1', github_org_name: 'org-1' }]
      });
      (organizationQuery.getGithubRepos as jest.Mock).mockResolvedValueOnce({
        type: 'error',
        error: { response: { status: 409 } }
      });
      jest.spyOn(console, 'error').mockImplementation(() => undefined);

      renderProducts();
      const button = await screen.findByText('Autorizar GitHub');
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('blocked');
      });
      fireEvent.click(button);

      expect(window.location.assign).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Não foi possível iniciar a autorização do GitHub.');
    });
  });

  it('handles github repos fetch generic error correctly', async () => {
    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValueOnce({
      type: 'success',
      value: [{ id: 'org-1', name: 'Org 1', key: 'org-1', github_org_name: 'org-1' }]
    });

    (organizationQuery.getGithubRepos as jest.Mock).mockResolvedValueOnce({
      type: 'error',
      error: { response: { status: 500 } }
    });

    renderProducts();

    await waitFor(() => {
      expect(screen.getByText('Não foi possível carregar os repositórios')).toBeInTheDocument();
      expect(screen.getByText('Tentar Novamente')).toBeInTheDocument();
    });
  });

  it('displays loading indicator while fetching repos', async () => {
    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({
      type: 'success',
      value: [{ id: 'org-1', name: 'Org 1', key: 'org-1', github_org_name: 'org-1' }]
    });

    let resolveRepos: any;
    const reposPromise = new Promise(resolve => { resolveRepos = resolve; });
    (organizationQuery.getGithubRepos as jest.Mock).mockReturnValue(reposPromise);

    renderProducts();

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    resolveRepos({
      type: 'success',
      value: { repos: [], totalPages: 1, nextPage: null }
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  describe('leitura do provider salvo', () => {
    it('não busca organizações enquanto o provider não foi lido e busca uma vez depois', async () => {
      (useAuth as jest.Mock).mockReturnValue({ provider: 'credentials', isProviderReady: false });

      const { rerender } = renderProducts();
      await act(async () => {});
      expect(organizationQuery.getGithubOrganizations).not.toHaveBeenCalled();
      expect(organizationQuery.getGitLabNamespaces).not.toHaveBeenCalled();

      (useAuth as jest.Mock).mockReturnValue({ provider: 'github', isProviderReady: true });
      rerender(withSWR(<Products />));

      await waitFor(() => {
        expect(organizationQuery.getGithubOrganizations).toHaveBeenCalledTimes(1);
      });
    });

    it('mostra um único toast de token inválido quando o provider muda de provisório para github', async () => {
      (organizationQuery.getGithubOrganizations as jest.Mock).mockResolvedValue({
        type: 'error',
        error: { response: { status: 409 } }
      });
      (useAuth as jest.Mock).mockReturnValue({ provider: 'credentials', isProviderReady: false });

      const { rerender } = renderProducts();
      (useAuth as jest.Mock).mockReturnValue({ provider: 'github', isProviderReady: true });
      rerender(withSWR(<Products />));

      expect(await screen.findByText('Autorizar GitHub')).toBeInTheDocument();
      expect(organizationQuery.getGithubOrganizations).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalledWith('Token do GitHub expirado ou inválido.');
    });

    it('usa as organizações do GitHub para quem entrou por credenciais', async () => {
      (useAuth as jest.Mock).mockReturnValue({ provider: 'credentials', isProviderReady: true });

      renderProducts();

      await waitFor(() => {
        expect(organizationQuery.getGithubOrganizations).toHaveBeenCalledTimes(1);
      });
      expect(organizationQuery.getGitLabNamespaces).not.toHaveBeenCalled();
      expect(await screen.findByText('Org 1')).toBeInTheDocument();
    });
  });

  describe('GitLab Provider in Products Component', () => {
    const mockSignInWithGitlab = jest.fn();

    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        provider: 'gitlab',
        isProviderReady: true,
        signInWithGithub: mockSignInWithGithub,
        signInWithGitlab: mockSignInWithGitlab
      });

      (organizationQuery.getGitLabNamespaces as jest.Mock).mockResolvedValue({
        type: 'success',
        value: [
          {
            id: 101,
            name: 'GitLab Group 1',
            full_path: 'gitlab-group-1',
            avatar_url: '',
            description: 'Group 1 Description',
            kind: 'group'
          }
        ]
      });

      (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({
        type: 'success',
        value: [{ id: 'org-gl-1', name: 'GitLab Group 1', key: 'gitlab-group-1' }]
      });

      (organizationQuery.getGitLabProjects as jest.Mock).mockResolvedValue({
        type: 'success',
        value: {
          projects: [
            {
              gitlab_project_id: 201,
              gitlab_path_with_namespace: 'gitlab-group-1/project-1',
              name: 'project-1',
              description: 'GitLab Project 1 Description',
              url: 'https://gitlab.com/gitlab-group-1/project-1'
            }
          ],
          totalPages: 1,
          nextPage: null
        }
      });

      (useOrganizationContext as jest.Mock).mockReturnValue({
        organizationList: [{ id: 'org-gl-1', name: 'GitLab Group 1', key: 'gitlab-group-1' }],
        currentOrganization: { id: 'org-gl-1', name: 'GitLab Group 1', key: 'gitlab-group-1' },
        setCurrentOrganizations: mockSetCurrentOrgs,
        fetchOrganizations: mockFetchOrgs
      });

      (productQuery.getAllProducts as jest.Mock).mockResolvedValue({
        data: { results: [{ id: 'prod-gl-1', name: 'Product GitLab' }] }
      });

      (useProductContext as jest.Mock).mockReturnValue({
        currentProduct: { id: 'prod-gl-1', name: 'Product GitLab' },
        updateProductList: mockUpdateProductList,
        setCurrentProduct: mockSetCurrentProduct
      });
    });

    it('loads gitlab namespaces and projects without querying github endpoints', async () => {
      renderProducts();

      await waitFor(() => {
        expect(organizationQuery.getGitLabNamespaces).toHaveBeenCalled();
        expect(organizationQuery.getGithubOrganizations).not.toHaveBeenCalled();
      });

      expect(await screen.findByText('GitLab Group 1')).toBeInTheDocument();
      expect(screen.getAllByText('Grupos do GitLab').length).toBeGreaterThanOrEqual(1);

      expect(await screen.findByText('gitlab-group-1/project-1')).toBeInTheDocument();

      await waitFor(() => {
        expect(organizationQuery.getGitLabProjects).toHaveBeenCalledWith('org-gl-1', 101, 'group', 1, '', 'prod-gl-1');
        expect(organizationQuery.getGithubRepos).not.toHaveBeenCalled();
      });
    });

    it('imports a gitlab group through the shared group endpoint when it is not in MeasureSoftGram yet', async () => {
      (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({ type: 'success', value: [] });
      (organizationQuery.importGitlabGroup as jest.Mock).mockResolvedValue({
        type: 'success',
        value: { id: 'org-gl-1' }
      });

      renderProducts();

      await waitFor(() => {
        expect(organizationQuery.importGitlabGroup).toHaveBeenCalledWith(101);
      });
      expect(organizationQuery.createOrganization).not.toHaveBeenCalled();
    });

    it('imports a gitlab project with platform gitlab', async () => {
      (repository.createRepository as jest.Mock).mockResolvedValueOnce({ type: 'success' });

      renderProducts();

      await waitFor(() => {
        expect(screen.getByText('gitlab-group-1/project-1')).toBeInTheDocument();
      });

      const importBtn = screen.getByText('Importar');
      await act(async () => {
        fireEvent.click(importBtn);
      });

      await waitFor(() => {
        expect(repository.createRepository).toHaveBeenCalledWith('org-gl-1', 'prod-gl-1', {
          name: 'project-1',
          url: 'https://gitlab.com/gitlab-group-1/project-1',
          description: 'GitLab Project 1 Description',
          platform: 'gitlab',
          imported: true
        });
        expect(toast.success).toHaveBeenCalledWith('Projeto project-1 importado com sucesso!');
      });
    });

    it('handles 409 error on gitlab namespaces with Autorizar GitLab button', async () => {
      (organizationQuery.getGitLabNamespaces as jest.Mock).mockResolvedValueOnce({
        type: 'error',
        error: { response: { status: 409 } }
      });

      renderProducts();

      await waitFor(() => {
        expect(screen.getByText('Token do GitLab expirado ou inválido')).toBeInTheDocument();
        expect(screen.getByText('Autorizar GitLab')).toBeInTheDocument();
      });
    });

    it('handles 409 error on gitlab projects with Autorizar GitLab button', async () => {
      (organizationQuery.getGitLabProjects as jest.Mock).mockResolvedValueOnce({
        type: 'error',
        error: { response: { status: 409 } }
      });

      renderProducts();

      await waitFor(() => {
        expect(screen.getByText('Token do GitLab expirado ou inválido')).toBeInTheDocument();
        expect(screen.getByText('Autorizar GitLab')).toBeInTheDocument();
      });

      const originalLocation = window.location;
      delete (window as any).location;
      window.location = { ...originalLocation, assign: jest.fn() } as any;

      const authBtn = screen.getByText('Autorizar GitLab');
      await act(async () => {
        fireEvent.click(authBtn);
      });

      const stored = JSON.parse(sessionStorage.getItem(OAUTH_STATE_KEY) as string);
      const url = new URL((window.location.assign as jest.Mock).mock.calls[0][0]);
      window.location = originalLocation;

      expect(stored).toMatchObject({ provider: 'gitlab', returnTo: '/products' });
      expect(url.origin + url.pathname).toBe('https://gitlab.com/oauth/authorize');
      expect(url.searchParams.get('state')).toBe(stored.nonce);
      expect(url.searchParams.get('scope')).toBe('read_user openid profile email read_api');
    });

    it('pagina os projetos do gitlab pelo total de páginas que o service repassa', async () => {
      (organizationQuery.getGitLabProjects as jest.Mock).mockResolvedValue({
        type: 'success',
        value: {
          projects: [
            {
              gitlab_project_id: 201,
              gitlab_path_with_namespace: 'gitlab-group-1/project-1',
              name: 'project-1',
              description: '',
              url: 'https://gitlab.com/gitlab-group-1/project-1'
            }
          ],
          totalPages: 3,
          nextPage: 2
        }
      });

      renderProducts();

      expect(await screen.findByRole('button', { name: 'Go to page 3' })).toBeInTheDocument();
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Go to page 2' }));
      });

      await waitFor(() => {
        expect(organizationQuery.getGitLabProjects).toHaveBeenCalledWith('org-gl-1', 101, 'group', 2, '', 'prod-gl-1');
      });
    });

    it('não mostra uma página seguinte quando o gitlab diz que é a última', async () => {
      renderProducts();

      expect(await screen.findByText('gitlab-group-1/project-1')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Go to page 2' })).not.toBeInTheDocument();
    });

    it('handles search and pagination queries to gitlab backend', async () => {
      renderProducts();

      await waitFor(() => {
        expect(screen.getByText('gitlab-group-1/project-1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Buscar projetos do produto...');
      await act(async () => {
        fireEvent.change(searchInput, { target: { value: 'custom-proj' } });
      });

      await waitFor(() => {
        expect(organizationQuery.getGitLabProjects).toHaveBeenCalledWith('org-gl-1', 101, 'group', 1, 'custom-proj', 'prod-gl-1');
      }, { timeout: 1000 });
    });

    it('creates organization if the gitlab personal space is not yet in backend', async () => {
      (organizationQuery.getGitLabNamespaces as jest.Mock).mockResolvedValue({
        type: 'success',
        value: [
          { id: 101, name: 'GitLab Group 1', full_path: 'gitlab-group-1', avatar_url: '', description: '', kind: 'user' }
        ]
      });
      (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValueOnce({
        type: 'success',
        value: []
      });
      (organizationQuery.createOrganization as jest.Mock).mockResolvedValueOnce({
        type: 'success',
        value: { id: 'org-gl-new', name: 'GitLab Group 1' }
      });

      renderProducts();

      await waitFor(() => {
        expect(organizationQuery.createOrganization).toHaveBeenCalledWith({ name: 'GitLab Group 1' });
      });
    });
  });
});

