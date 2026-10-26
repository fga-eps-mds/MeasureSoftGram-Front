import api from '../api';
import { organizationQuery } from '../organization'; // Ajuste o caminho se necessário

jest.mock('../api');

describe('Organization Service', () => {
  const mockPayload = { name: 'Nova Org', key: 'NOVA' };
  const NETWORK_ERROR = 'Network error';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // CAMINHOS DE SUCESSO
  // ==========================================

  it('deve listar as organizações (GET)', async () => {
    const mockOrgs = { results: [{ id: '1', name: 'Org 1' }] };
    (api.get as jest.Mock).mockResolvedValue({ data: mockOrgs });

    const result = await organizationQuery.getAllOrganization();

    expect(api.get).toHaveBeenCalledWith('/v1/organizations/');
    expect(result.type).toEqual('success');
    expect((result as any).value).toEqual(mockOrgs.results);
  });

  it('deve buscar uma organização por ID (GET)', async () => {
    const mockOrg = { id: '1', name: 'Org 1' };
    (api.get as jest.Mock).mockResolvedValue({ data: mockOrg });

    const result = await organizationQuery.getOrganizationById('1');

    expect(api.get).toHaveBeenCalledWith('/v1/organizations/1/');
    expect(result.type).toEqual('success');
  });

  it('deve criar uma nova organização (POST)', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { id: '2', ...mockPayload } });

    const result = await organizationQuery.createOrganization(mockPayload);
    expect(api.post).toHaveBeenCalledWith('/v1/organizations/', mockPayload);
    expect(result.type).toEqual('success');
  });

  it('deve atualizar uma organização existente (PUT)', async () => {
    (api.put as jest.Mock).mockResolvedValue({ data: mockPayload });

    const result = await organizationQuery.updateOrganization('1', mockPayload);
    expect(api.put).toHaveBeenCalledWith('/v1/organizations/1/', mockPayload);
    expect(result.type).toEqual('success');
  });

  it('deve deletar uma organização (DELETE)', async () => {
    (api.delete as jest.Mock).mockResolvedValue({ status: 204 });

    const result = await organizationQuery.deleteOrganization('1');
    expect(api.delete).toHaveBeenCalledWith('/v1/organizations/1/');
    expect(result.type).toEqual('success');
  });

  // ==========================================
  // CAMINHOS DE ERRO E EXCEÇÃO (Aumentam a cobertura)
  // ==========================================

  it('deve lidar com falha genérica no getAllOrganization', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error(NETWORK_ERROR));
    const result = await organizationQuery.getAllOrganization();
    expect(result.type).toEqual('error');
  });

  it('deve lidar com falha genérica no getOrganizationById', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error(NETWORK_ERROR));
    const result = await organizationQuery.getOrganizationById('1');
    expect(result.type).toEqual('error');
  });

  it('deve lidar com falha genérica no deleteOrganization', async () => {
    (api.delete as jest.Mock).mockRejectedValue(new Error(NETWORK_ERROR));
    const result = await organizationQuery.deleteOrganization('1');
    expect(result.type).toEqual('error');
  });

  // Testes de Status 400 (Tratamento de Bad Request da API)

  it('deve retornar erro de nome duplicado ao criar organização', async () => {
    const errorResponse = {
      response: {
        status: 400,
        data: { name: ['Organization with this name already exists.'] }
      }
    };
    (api.post as jest.Mock).mockRejectedValue(errorResponse);

    const result = await organizationQuery.createOrganization(mockPayload);

    expect(result.type).toEqual('error');
    expect((result as any).error.message).toBe('Já existe uma organização com este nome.');
  });

  it('deve retornar erro de chave duplicada ao criar organização', async () => {
    const errorResponse = {
      response: {
        status: 400,
        data: { key: ['Organization with this key already exists.'] }
      }
    };
    (api.post as jest.Mock).mockRejectedValue(errorResponse);

    const result = await organizationQuery.createOrganization(mockPayload);

    expect(result.type).toEqual('error');
    expect((result as any).error.message).toBe('Já existe uma organização com esta chave.');
  });

  it('deve retornar erro genérico ao falhar na criação', async () => {
    (api.post as jest.Mock).mockRejectedValue(new Error('Erro interno'));

    const result = await organizationQuery.createOrganization(mockPayload);

    expect(result.type).toEqual('error');
    expect((result as any).error.message).toBe('Ocorreu um erro ao criar organização.');
  });

  it('deve retornar erro de nome duplicado ao atualizar organização', async () => {
    const errorResponse = {
      response: {
        status: 400,
        data: { name: ['Organization with this name already exists.'] }
      }
    };
    (api.put as jest.Mock).mockRejectedValue(errorResponse);

    const result = await organizationQuery.updateOrganization('1', mockPayload);

    expect(result.type).toEqual('error');
    expect((result as any).error.message).toBe('Já existe uma organização com este nome.');
  });

  it('deve retornar erro de chave duplicada ao atualizar organização', async () => {
    const errorResponse = {
      response: {
        status: 400,
        data: { key: ['Organization with this key already exists.'] }
      }
    };
    (api.put as jest.Mock).mockRejectedValue(errorResponse);

    const result = await organizationQuery.updateOrganization('1', mockPayload);

    expect(result.type).toEqual('error');
    expect((result as any).error.message).toBe('Já existe uma organização com esta chave.');
  });

  it('deve retornar erro genérico ao falhar na atualização', async () => {
    (api.put as jest.Mock).mockRejectedValue(new Error('Erro interno'));

    const result = await organizationQuery.updateOrganization('1', mockPayload);

    expect(result.type).toEqual('error');
    expect((result as any).error.message).toBe('Ocorreu um erro ao atualizar organização.');
  });

  // Testes de getGithubOrganizations
  it('deve buscar organizações do GitHub (GET)', async () => {
    const mockGithubOrgs = [{ github_org_id: 1, github_org_name: 'Org1' }];
    (api.get as jest.Mock).mockResolvedValue({ data: mockGithubOrgs });

    const result = await organizationQuery.getGithubOrganizations();

    expect(api.get).toHaveBeenCalledWith('/v1/accounts/github-organizations/');
    expect(result.type).toBe('success');
    expect((result as any).value).toEqual(mockGithubOrgs);
  });

  it('deve retornar erro ao falhar buscar organizações do GitHub', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error(NETWORK_ERROR));
    const result = await organizationQuery.getGithubOrganizations();
    expect(result.type).toBe('error');
  });

  // Testes de importOrganization
  it('deve importar organização do GitHub (POST)', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { id: '1', name: 'Org1' } });

    const result = await organizationQuery.importOrganization('Org1');

    expect(api.post).toHaveBeenCalledWith('/v1/organizations/import/', { github_org_name: 'Org1' });
    expect(result.type).toBe('success');
    expect((result as any).value).toEqual({ id: '1', name: 'Org1' });
  });

  it('deve retornar erro ao falhar importar organização do GitHub', async () => {
    (api.post as jest.Mock).mockRejectedValue(new Error(NETWORK_ERROR));
    const result = await organizationQuery.importOrganization('Org1');
    expect(result.type).toBe('error');
  });

  it('deve importar grupo do GitLab (POST)', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { id: '9', name: 'Grupo' } });

    const result = await organizationQuery.importGitlabGroup(77);

    expect(api.post).toHaveBeenCalledWith('/v1/organizations/import-gitlab/', { gitlab_group_id: 77 });
    expect(result.type).toBe('success');
  });

  it('deve retornar erro ao falhar importar grupo do GitLab', async () => {
    (api.post as jest.Mock).mockRejectedValue(new Error(NETWORK_ERROR));
    const result = await organizationQuery.importGitlabGroup(77);
    expect(result.type).toBe('error');
  });

  // Testes de getGithubRepos
  it('deve buscar repositórios do GitHub (GET)', async () => {
    const mockRepos = [{ github_repo_id: 1, name: 'repo1' }];
    (api.get as jest.Mock).mockResolvedValue({
      data: mockRepos,
      headers: { 'x-total-pages': '66', 'x-next-page': '3' }
    });

    const result = await organizationQuery.getGithubRepos('1', 2, 'repo');

    expect(api.get).toHaveBeenCalledWith('/v1/organizations/1/github-repos/', {
      params: { page: 2, search: 'repo' }
    });
    expect(result.type).toBe('success');
    expect((result as any).value).toEqual({ repos: mockRepos, totalPages: 66, nextPage: 3 });
  });

  it('deve retornar erro ao falhar buscar repositórios do GitHub', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error(NETWORK_ERROR));
    const result = await organizationQuery.getGithubRepos('1');
    expect(result.type).toBe('error');
  });

  // Testes de getGitLabNamespaces
  it('deve buscar namespaces do GitLab (GET)', async () => {
    const mockNamespaces = [
      { id: 1, name: 'Group 1', full_path: 'group-1', avatar_url: '', description: 'Desc', kind: 'group' }
    ];
    (api.get as jest.Mock).mockResolvedValue({ data: mockNamespaces });

    const result = await organizationQuery.getGitLabNamespaces();

    expect(api.get).toHaveBeenCalledWith('/v1/accounts/gitlab-namespaces/');
    expect(result.type).toBe('success');
    expect((result as any).value).toEqual(mockNamespaces);
  });

  it('deve retornar erro ao falhar buscar namespaces do GitLab', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error(NETWORK_ERROR));
    const result = await organizationQuery.getGitLabNamespaces();
    expect(result.type).toBe('error');
  });

  // Testes de getGitLabProjects
  it('deve buscar projetos do GitLab com parâmetros (GET)', async () => {
    const mockProjects = [
      {
        gitlab_project_id: 10,
        gitlab_path_with_namespace: 'group-1/proj-1',
        name: 'proj-1',
        description: 'Desc',
        url: 'https://gitlab.com/group-1/proj-1'
      }
    ];
    (api.get as jest.Mock).mockResolvedValue({
      data: mockProjects,
      headers: { 'x-total-pages': '4', 'x-next-page': '3' }
    });

    const result = await organizationQuery.getGitLabProjects('org-1', 1, 'group', 2, 'search-term');

    expect(api.get).toHaveBeenCalledWith('/v1/organizations/org-1/gitlab-projects/', {
      params: {
        namespace_id: 1,
        kind: 'group',
        page: 2,
        search: 'search-term'
      }
    });
    expect(result.type).toBe('success');
    expect((result as any).value).toEqual({ projects: mockProjects, totalPages: 4, nextPage: 3 });
  });

  it('não informa próxima página quando o GitLab manda o header vazio', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: [], headers: { 'x-next-page': '' } });

    const result = await organizationQuery.getGitLabProjects('org-1', 1, 'group', 1, '');

    expect((result as any).value).toEqual({ projects: [], totalPages: null, nextPage: null });
  });

  it('deve retornar erro ao falhar buscar projetos do GitLab', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error(NETWORK_ERROR));
    const result = await organizationQuery.getGitLabProjects('org-1', 1, 'group', 1, '');
    expect(result.type).toBe('error');
  });
});

