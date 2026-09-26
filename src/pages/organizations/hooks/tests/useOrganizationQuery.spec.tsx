import { renderHook, act } from '@testing-library/react';
import { organizationQuery } from '@services/organization';
import { useOrganizationQuery } from '../useOrganizationQuery';

const mockFetchOrganizations = jest.fn();

jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: () => ({
    fetchOrganizations: mockFetchOrganizations,
  }),
}));

jest.mock('@services/organization', () => ({
  organizationQuery: {
    getAllOrganization: jest.fn(),
    createOrganization: jest.fn(),
    getOrganizationById: jest.fn(),
    updateOrganization: jest.fn(),
    deleteOrganization: jest.fn(),
  },
}));

describe('useOrganizationQuery Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar uma organização com sucesso e disparar atualização', async () => {
    (organizationQuery.createOrganization as jest.Mock).mockResolvedValue({ type: 'success' });

    const { result } = renderHook(() => useOrganizationQuery());

    await act(async () => {
      await result.current.createOrganization({ name: 'Nova Org' } as any);
    });

    expect(organizationQuery.createOrganization).toHaveBeenCalledWith({ name: 'Nova Org' });
    expect(mockFetchOrganizations).toHaveBeenCalledWith(true);
  });

  it('NÃO deve disparar atualização se a criação falhar', async () => {
    (organizationQuery.createOrganization as jest.Mock).mockResolvedValue({ type: 'error' });

    const { result } = renderHook(() => useOrganizationQuery());

    await act(async () => {
      await result.current.createOrganization({ name: 'Nova Org' } as any);
    });

    expect(organizationQuery.createOrganization).toHaveBeenCalledWith({ name: 'Nova Org' });
    expect(mockFetchOrganizations).not.toHaveBeenCalled();
  });

  it('deve deletar uma organização com sucesso e disparar atualização', async () => {
    (organizationQuery.deleteOrganization as jest.Mock).mockResolvedValue({ type: 'success' });

    const { result } = renderHook(() => useOrganizationQuery());

    await act(async () => {
      await result.current.deleteOrganization('1');
    });

    expect(organizationQuery.deleteOrganization).toHaveBeenCalledWith('1');
    expect(mockFetchOrganizations).toHaveBeenCalledWith(true);
  });

  it('NÃO deve disparar atualização se a deleção falhar', async () => {
    (organizationQuery.deleteOrganization as jest.Mock).mockResolvedValue({ type: 'error' });

    const { result } = renderHook(() => useOrganizationQuery());

    await act(async () => {
      await result.current.deleteOrganization('1');
    });

    expect(organizationQuery.deleteOrganization).toHaveBeenCalledWith('1');
    expect(mockFetchOrganizations).not.toHaveBeenCalled();
  });

  it('deve atualizar uma organização com sucesso e disparar atualização', async () => {
    const orgEditadaName = 'Org Editada';
    (organizationQuery.updateOrganization as jest.Mock).mockResolvedValue({ type: 'success' });

    const { result } = renderHook(() => useOrganizationQuery());

    await act(async () => {
      await result.current.updateOrganization('1', { name: orgEditadaName } as any);
    });

    expect(organizationQuery.updateOrganization).toHaveBeenCalledWith('1', { name: orgEditadaName });
    expect(mockFetchOrganizations).toHaveBeenCalledWith(true);
  });

  it('NÃO deve disparar atualização se a atualização falhar', async () => {
    const orgEditadaName = 'Org Editada';
    (organizationQuery.updateOrganization as jest.Mock).mockResolvedValue({ type: 'error' });

    const { result } = renderHook(() => useOrganizationQuery());

    await act(async () => {
      await result.current.updateOrganization('1', { name: orgEditadaName } as any);
    });

    expect(organizationQuery.updateOrganization).toHaveBeenCalledWith('1', { name: orgEditadaName });
    expect(mockFetchOrganizations).not.toHaveBeenCalled();
  });

  it('deve repassar a chamada de getOrganizationById corretamente', async () => {
    (organizationQuery.getOrganizationById as jest.Mock).mockResolvedValue({ type: 'success', value: { id: '1', name: 'Org 1' } });

    const { result } = renderHook(() => useOrganizationQuery());

    let res;
    await act(async () => {
      res = await result.current.getOrganizationById('1');
    });

    expect(organizationQuery.getOrganizationById).toHaveBeenCalledWith('1');
    expect(res).toEqual({ type: 'success', value: { id: '1', name: 'Org 1' } });
  });
});