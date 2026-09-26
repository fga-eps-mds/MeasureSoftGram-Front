import { getAccessToken } from '@services/Auth';
import api from '../api';
import { organizationQuery } from '../organization'; // Ajuste o caminho se necessário

jest.mock('../api');

// Precisamos mockar o Auth dessa forma para conseguir alterar
// o retorno dele nos testes de erro.
jest.mock('@services/Auth', () => ({
  getAccessToken: jest.fn()
}));

describe('Organization Service', () => {
  const mockPayload = { name: 'Nova Org', key: 'NOVA' };
  const NETWORK_ERROR = 'Network error';

  beforeEach(() => {
    jest.clearAllMocks();

    // Configuração padrão de sucesso para o token na maioria dos testes
    (getAccessToken as jest.Mock).mockResolvedValue({
      type: 'success',
      value: { key: 'mock-token' }
    });
  });

  // ==========================================
  // CAMINHOS DE SUCESSO
  // ==========================================

  it('deve listar as organizações (GET)', async () => {
    const mockOrgs = { results: [{ id: '1', name: 'Org 1' }] };
    (api.get as jest.Mock).mockResolvedValue({ data: mockOrgs });

    const result = await organizationQuery.getAllOrganization();

    expect(api.get).toHaveBeenCalledWith('/v1/organizations/', expect.any(Object));
    expect(result.type).toEqual('success');
    expect((result as any).value).toEqual(mockOrgs.results);
  });

  it('deve buscar uma organização por ID (GET)', async () => {
    const mockOrg = { id: '1', name: 'Org 1' };
    (api.get as jest.Mock).mockResolvedValue({ data: mockOrg });

    const result = await organizationQuery.getOrganizationById('1');

    expect(api.get).toHaveBeenCalledWith('/v1/organizations/1/', expect.any(Object));
    expect(result.type).toEqual('success');
  });

  it('deve criar uma nova organização (POST)', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { id: '2', ...mockPayload } });

    const result = await organizationQuery.createOrganization(mockPayload);
    expect(api.post).toHaveBeenCalledWith('/v1/organizations/', mockPayload, expect.any(Object));
    expect(result.type).toEqual('success');
  });

  it('deve atualizar uma organização existente (PUT)', async () => {
    (api.put as jest.Mock).mockResolvedValue({ data: mockPayload });

    const result = await organizationQuery.updateOrganization('1', mockPayload);
    expect(api.put).toHaveBeenCalledWith('/v1/organizations/1/', mockPayload, expect.any(Object));
    expect(result.type).toEqual('success');
  });

  it('deve deletar uma organização (DELETE)', async () => {
    (api.delete as jest.Mock).mockResolvedValue({ status: 204 });

    const result = await organizationQuery.deleteOrganization('1');
    expect(api.delete).toHaveBeenCalledWith('/v1/organizations/1/', expect.any(Object));
    expect(result.type).toEqual('success');
  });

  // ==========================================
  // CAMINHOS DE ERRO E EXCEÇÃO (Aumentam a cobertura)
  // ==========================================

  it('deve retornar erro se o token de acesso não for encontrado', async () => {
    // Força o getAccessToken a retornar um erro
    (getAccessToken as jest.Mock).mockResolvedValue({ type: 'error' });

    const result = await organizationQuery.getAllOrganization();

    expect(result.type).toEqual('error');
    expect((result as any).error.message).toBe('Token de acesso não encontrado.');
  });

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

    expect(api.get).toHaveBeenCalledWith('/v1/accounts/github-organizations/', expect.any(Object));
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

    expect(api.post).toHaveBeenCalledWith('/v1/organizations/import/', { github_org_name: 'Org1' }, expect.any(Object));
    expect(result.type).toBe('success');
    expect((result as any).value).toEqual({ id: '1', name: 'Org1' });
  });

  it('deve retornar erro ao falhar importar organização do GitHub', async () => {
    (api.post as jest.Mock).mockRejectedValue(new Error(NETWORK_ERROR));
    const result = await organizationQuery.importOrganization('Org1');
    expect(result.type).toBe('error');
  });

  // Testes de getGithubRepos
  it('deve buscar repositórios do GitHub (GET)', async () => {
    const mockRepos = [{ github_repo_id: 1, name: 'repo1' }];
    (api.get as jest.Mock).mockResolvedValue({ data: mockRepos });

    const result = await organizationQuery.getGithubRepos('1');

    expect(api.get).toHaveBeenCalledWith('/v1/organizations/1/github-repos/', expect.any(Object));
    expect(result.type).toBe('success');
    expect((result as any).value).toEqual(mockRepos);
  });

  it('deve retornar erro ao falhar buscar repositórios do GitHub', async () => {
    (api.get as jest.Mock).mockRejectedValue(new Error(NETWORK_ERROR));
    const result = await organizationQuery.getGithubRepos('1');
    expect(result.type).toBe('error');
  });

  // Teste de erro de token em outros métodos
  it('deve retornar erro se o token de acesso não for encontrado para outros métodos', async () => {
    (getAccessToken as jest.Mock).mockResolvedValue({ type: 'error' });

    const createRes = await organizationQuery.createOrganization(mockPayload);
    expect(createRes.type).toBe('error');

    const getByIdRes = await organizationQuery.getOrganizationById('1');
    expect(getByIdRes.type).toBe('error');

    const updateRes = await organizationQuery.updateOrganization('1', mockPayload);
    expect(updateRes.type).toBe('error');

    const deleteRes = await organizationQuery.deleteOrganization('1');
    expect(deleteRes.type).toBe('error');

    const getGithubOrgsRes = await organizationQuery.getGithubOrganizations();
    expect(getGithubOrgsRes.type).toBe('error');

    const importRes = await organizationQuery.importOrganization('Org1');
    expect(importRes.type).toBe('error');

    const getReposRes = await organizationQuery.getGithubRepos('1');
    expect(getReposRes.type).toBe('error');
  });

});
