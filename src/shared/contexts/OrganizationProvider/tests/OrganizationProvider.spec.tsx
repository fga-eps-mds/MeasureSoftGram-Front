import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { OrganizationProvider, useOrganizationContext } from '../OrganizationProvider';
import { organizationQuery } from '@services/organization';
import { toast } from 'react-toastify';
import { useAuth } from '@contexts/Auth';

// Mocks
jest.mock('@services/organization', () => ({
  organizationQuery: {
    getAllOrganization: jest.fn(),
    getGithubOrganizations: jest.fn(),
    importOrganization: jest.fn(),
  }
}));

jest.mock('@contexts/Auth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  }
}));

// Componente utilitário para expor os estados internos do Provider na árvore DOM e podermos testá-los
const TestComponent = () => {
  const { currentOrganization, organizationList } = useOrganizationContext();
  return (
    <div>
      <span data-testid="org-len">{organizationList.length}</span>
      <span data-testid="curr-org">{currentOrganization ? currentOrganization.name : 'none'}</span>
    </div>
  );
};

describe('OrganizationProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Limpeza fundamental para os testes rodarem de forma independente,
    // já que o componente agora usa sessionStorage para evitar reconsultas ao GitHub.
    sessionStorage.clear();
    localStorage.clear();

    // Mock padrão (caminho de sucesso)
    (useAuth as jest.Mock).mockReturnValue({
      session: { username: 'testuser' },
    });

    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({
      type: 'success',
      value: [
        { id: '1', name: 'Org 1', key: 'O1' }
      ]
    });

    (organizationQuery.getGithubOrganizations as jest.Mock).mockResolvedValue({
      type: 'success',
      value: []
    });

    (organizationQuery.importOrganization as jest.Mock).mockResolvedValue({
      type: 'success',
      value: { id: '2', name: 'Github Org 2' }
    });
  });

  it('should load organizations if session exists', async () => {
    render(
      <OrganizationProvider>
        <TestComponent />
      </OrganizationProvider>
    );

    // Espera a UI atualizar e validar se o banco foi consultado com sucesso
    await waitFor(() => {
      expect(screen.getByTestId('curr-org').textContent).toBe('Org 1');
      expect(screen.getByTestId('org-len').textContent).toBe('1');
    });
  });

  it('should auto-import github organizations that are not in backend', async () => {
    // Simulamos que o GitHub tem uma organização que não veio no getAllOrganization
    (organizationQuery.getGithubOrganizations as jest.Mock).mockResolvedValue({
      type: 'success',
      value: [
        { github_org_name: 'Github Org 2' } // Faltando no BD
      ]
    });

    render(
      <OrganizationProvider>
        <TestComponent />
      </OrganizationProvider>
    );

    // Valida se ele chamou a importação por trás dos panos (background sync)
    await waitFor(() => {
      expect(organizationQuery.importOrganization).toHaveBeenCalledWith('Github Org 2');
    });
  });

  it('should load organization from local storage', async () => {
    // Colocamos duas organizações
    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({
      type: 'success',
      value: [
        { id: '1', name: 'Org 1', key: 'O1' },
        { id: '2', name: 'Org 2', key: 'O2' }
      ]
    });

    // Injetamos a Org 2 como a última que foi selecionada
    localStorage.setItem('selectedOrgId', JSON.stringify('2'));

    render(
      <OrganizationProvider>
        <TestComponent />
      </OrganizationProvider>
    );

    // Se o cache/storage funcionou, a Org 2 deverá ser o foco principal
    await waitFor(() => {
      expect(screen.getByTestId('curr-org').textContent).toBe('Org 2');
    });
  });

  it('should handle api error when type is not success', async () => {
    // Forçamos o serviço a responder um "error" customizado
    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({
      type: 'error'
    });

    render(
      <OrganizationProvider>
        <TestComponent />
      </OrganizationProvider>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar organizações.');
    });
  });

  it('should handle api exception', async () => {
    // Forçamos o Axios / Serviço a estourar uma exception fatal
    (organizationQuery.getAllOrganization as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(
      <OrganizationProvider>
        <TestComponent />
      </OrganizationProvider>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao carregar organizações. Por favor, tente novamente.');
    });
  });
});
