import React from 'react';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import { organizationQuery } from '@services/organization';
import { useAuth } from '@contexts/Auth';
import { toast } from 'react-toastify';
import { OrganizationProvider, useOrganizationContext } from '../OrganizationProvider';

jest.mock('@services/organization');
jest.mock('@contexts/Auth');
jest.mock('react-toastify', () => ({
  toast: { error: jest.fn() }
}));

const mockSession = { user: { email: 'test@test.com' } };

describe('OrganizationProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should render children and initialize correctly without session', async () => {
    (useAuth as jest.Mock).mockReturnValue({ session: null });
    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({ type: 'success', value: [] });
    
    const Child = () => {
      const { currentOrganization, organizationList, isLoading, fetchOrganizations } = useOrganizationContext();
      return (
        <div>
          <span data-testid="org-len">{organizationList.length}</span>
          <span data-testid="curr-org">{currentOrganization?.name || 'none'}</span>
          <span data-testid="is-loading">{isLoading ? 'yes' : 'no'}</span>
          <button onClick={() => fetchOrganizations(true)}>Fetch</button>
        </div>
      );
    };

    render(
      <OrganizationProvider>
        <Child />
      </OrganizationProvider>
    );

    expect(screen.getByTestId('org-len').textContent).toBe('0');
    
    // Fetch manually
    await act(async () => {
       fireEvent.click(screen.getByText('Fetch'));
    });
    
    expect(organizationQuery.getAllOrganization).toHaveBeenCalled();
  });

  it('should load organizations if session exists', async () => {
    (useAuth as jest.Mock).mockReturnValue({ session: mockSession });
    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({
      type: 'success',
      value: [{ id: 'org-1', name: 'Org 1', description: '', url: '', products: [], key: 'org1' }]
    });
    (organizationQuery.getGithubOrganizations as jest.Mock).mockResolvedValue({
      type: 'success',
      value: []
    });

    const Child = () => {
      const { currentOrganization, organizationList } = useOrganizationContext();
      return (
        <div>
          <span data-testid="org-len">{organizationList.length}</span>
          <span data-testid="curr-org">{currentOrganization?.name || 'none'}</span>
        </div>
      );
    };

    render(
      <OrganizationProvider>
        <Child />
      </OrganizationProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('curr-org').textContent).toBe('Org 1');
    });
  });

  it('should auto-import github organizations that are not in backend', async () => {
    (useAuth as jest.Mock).mockReturnValue({ session: mockSession });
    (organizationQuery.getAllOrganization as jest.Mock)
      .mockResolvedValueOnce({
        type: 'success',
        value: [{ id: 'org-1', name: 'Org 1', description: '', url: '', products: [], key: 'org1' }]
      })
      .mockResolvedValueOnce({
        type: 'success',
        value: [
          { id: 'org-1', name: 'Org 1', description: '', url: '', products: [], key: 'org1' },
          { id: 'org-2', name: 'Github Org 2', description: '', url: '', products: [], key: 'githuborg2' }
        ]
      });

    (organizationQuery.getGithubOrganizations as jest.Mock).mockResolvedValue({
      type: 'success',
      value: [{ github_org_name: 'Github Org 2' }]
    });

    (organizationQuery.importOrganization as jest.Mock).mockResolvedValue({ type: 'success' });

    const Child = () => {
      const { organizationList } = useOrganizationContext();
      return (
        <div>
          <span data-testid="org-len">{organizationList.length}</span>
        </div>
      );
    };

    render(
      <OrganizationProvider>
        <Child />
      </OrganizationProvider>
    );

    await waitFor(() => {
      expect(organizationQuery.importOrganization).toHaveBeenCalledWith('Github Org 2');
    });

    await waitFor(() => {
      expect(screen.getByTestId('org-len').textContent).toBe('2');
    });
  });

  it('should load organization from local storage', async () => {
    localStorage.setItem('selectedOrgId', '"org-2"');
    (useAuth as jest.Mock).mockReturnValue({ session: mockSession });
    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({
      type: 'success',
      value: [
        { id: 'org-1', name: 'Org 1', description: '', url: '', products: [], key: 'org1' },
        { id: 'org-2', name: 'Org 2', description: '', url: '', products: [], key: 'org2' }
      ]
    });
    (organizationQuery.getGithubOrganizations as jest.Mock).mockResolvedValue({ type: 'error' });

    const Child = () => {
      const { currentOrganizations } = useOrganizationContext();
      return (
        <div>
          <span data-testid="curr-org">{currentOrganizations[0]?.name || 'none'}</span>
        </div>
      );
    };

    render(
      <OrganizationProvider>
        <Child />
      </OrganizationProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('curr-org').textContent).toBe('Org 2');
    });
  });

  it('should handle api error when type is not success', async () => {
    (useAuth as jest.Mock).mockReturnValue({ session: mockSession });
    (organizationQuery.getAllOrganization as jest.Mock).mockResolvedValue({ type: 'error' });

    render(
      <OrganizationProvider>
        <div />
      </OrganizationProvider>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Erro ao carregar organizações.");
    });
  });

  it('should handle api exception', async () => {
    (useAuth as jest.Mock).mockReturnValue({ session: mockSession });
    (organizationQuery.getAllOrganization as jest.Mock).mockRejectedValue(new Error('api error'));

    render(
      <OrganizationProvider>
        <div />
      </OrganizationProvider>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Erro ao carregar organizações. Por favor, tente novamente.");
    });
  });

  it('should throw error when used outside provider', () => {
    const Child = () => {
      useOrganizationContext();
      return <div />;
    };
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Child />)).toThrow('OrganizationContext must be used within a OrganizationProvider');
    consoleSpy.mockRestore();
  });
});
