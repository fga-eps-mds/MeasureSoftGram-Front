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
import Products from '../Products';

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
    (useAuth as jest.Mock).mockReturnValue({ signInWithGithub: mockSignInWithGithub });
    
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
      value: [{ github_repo_id: 1, name: 'Repo 1', url: 'http://repo1', description: '' }]
    });

    (productQuery.getAllRepositories as jest.Mock).mockResolvedValue({
      data: { results: [] }
    });
  });

  it('renders and loads initial data', async () => {
    await act(async () => { render(<Products />); });
    
    await waitFor(() => {
      expect(organizationQuery.getGithubOrganizations).toHaveBeenCalled();
    });
    
    expect(await screen.findByText('Org 1')).toBeInTheDocument();
  });

  it('exchanges code if present in router query', async () => {
    (useRouter as jest.Mock).mockReturnValue({ query: { code: '123' }, replace: mockReplace });
    mockSignInWithGithub.mockResolvedValueOnce({ type: 'success' });
    
    await act(async () => { render(<Products />); });
    
    await waitFor(() => {
      expect(mockSignInWithGithub).toHaveBeenCalledWith('123');
      expect(toast.success).toHaveBeenCalledWith("Organizações do GitHub vinculadas com sucesso!");
    });
  });

  it('exchanges code fails', async () => {
    (useRouter as jest.Mock).mockReturnValue({ query: { code: '123' }, replace: mockReplace });
    mockSignInWithGithub.mockResolvedValueOnce({ type: 'error' });
    
    await act(async () => { render(<Products />); });
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Erro ao vincular organizações do GitHub.");
    });
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

    await act(async () => { render(<Products />); });

    await waitFor(() => {
      expect(organizationQuery.importOrganization).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Repo 1')).toBeInTheDocument();
    });
  });

  it('handles importing a repo successfully', async () => {
    (repository.createRepository as jest.Mock).mockResolvedValueOnce({ type: 'success' });
    
    await act(async () => { render(<Products />); });

    await waitFor(() => {
      expect(screen.getByText('Repo 1')).toBeInTheDocument();
    });

    const importBtn = screen.getByText('Importar');
    await act(async () => { fireEvent.click(importBtn); });

    await waitFor(() => {
      expect(repository.createRepository).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Repositório Repo 1 importado com sucesso!');
    });
  });
  
  it('handles importing a repo with error', async () => {
    (repository.createRepository as jest.Mock).mockResolvedValueOnce({ type: 'error', error: { message: 'Erro teste' } });
    
    await act(async () => { render(<Products />); });

    await waitFor(() => {
      expect(screen.getByText('Repo 1')).toBeInTheDocument();
    });

    const importBtn = screen.getByText('Importar');
    await act(async () => { fireEvent.click(importBtn); });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao importar repositório: Erro teste');
    });
  });

  it('can change tabs, search and pagination', async () => {
    (organizationQuery.getGithubRepos as jest.Mock).mockResolvedValue({
      type: 'success',
      value: Array.from({ length: 15 }).map((_, i) => ({ github_repo_id: i, name: `Repo ${i}`, url: `http://repo${i}`, description: '' }))
    });

    await act(async () => { render(<Products />); });

    await waitFor(() => {
      expect(screen.getByText('Repo 0')).toBeInTheDocument();
    });

    const todosTab = screen.getByText('Todos');
    await act(async () => { fireEvent.click(todosTab); });
    
    const aImportarTab = screen.getByText('A Importar');
    await act(async () => { fireEvent.click(aImportarTab); });

    const importadosTab = screen.getByText('Importados');
    await act(async () => { fireEvent.click(importadosTab); });
    
    const searchInput = screen.getByPlaceholderText('Buscar repositórios do produto...');
    await act(async () => { fireEvent.change(searchInput, { target: { value: 'Repo 10' } }); });

    await waitFor(() => {
      expect(screen.queryByText('Repo 0')).not.toBeInTheDocument();
    });
    
    await act(async () => { fireEvent.change(searchInput, { target: { value: '' } }); });
    await act(async () => { fireEvent.click(todosTab); });
    
    // pagination - clicking page 2
    let page2Button;
    await waitFor(() => {
      page2Button = screen.getByText('2');
      expect(page2Button).toBeInTheDocument();
    });
    await act(async () => { fireEvent.click(page2Button); });
    
    await waitFor(() => {
      expect(screen.getByText('Repo 12')).toBeInTheDocument();
    });
  });

  it('handles empty products list', async () => {
    (productQuery.getAllProducts as jest.Mock).mockResolvedValue({
      data: { results: [] }
    });

    await act(async () => { render(<Products />); });

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

    await act(async () => { render(<Products />); });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Erro ao buscar organizações do GitHub.');
    });
  });

  it('handles loadGitHubOrgs exception', async () => {
    (organizationQuery.getGithubOrganizations as jest.Mock).mockRejectedValue(new Error('Network error'));

    await act(async () => { render(<Products />); });

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

    await act(async () => { render(<Products />); });

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

    await act(async () => { render(<Products />); });

    await waitFor(() => {
      expect(organizationQuery.getOrganizationById).toHaveBeenCalledWith('org-3');
    });
    expect(await screen.findByText('Org 3')).toBeInTheDocument();
  });
});
