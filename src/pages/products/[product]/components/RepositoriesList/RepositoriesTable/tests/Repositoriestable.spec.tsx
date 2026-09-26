import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';
import { useProductContext } from '@contexts/ProductProvider';
import { useOrganizationContext } from '@contexts/OrganizationProvider';
import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { useQuery } from '@hooks/useQuery';
import { productQuery } from '@services/product';
import { act } from 'react-dom/test-utils';
import RepositoriesTable from '../RepositoriesTable';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: jest.fn(),
}));

jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: jest.fn(),
}));

jest.mock('@contexts/RepositoryProvider', () => ({
  useRepositoryContext: jest.fn(),
}));

jest.mock('@hooks/useQuery', () => ({
  useQuery: jest.fn(),
}));

jest.mock('@services/product', () => ({
  productQuery: {
    getAllRepositories: jest.fn(),
  },
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const repoName = 'Repository 1';

describe('RepositoriesTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue({ push: jest.fn(), query: { product: '1-3-2024-measure' } });
    useProductContext.mockReturnValue({ currentProduct: { id: '1', name: 'Product A' } });
    useOrganizationContext.mockReturnValue({ currentOrganization: { id: '1' } });
    useRepositoryContext.mockReturnValue({ repositoriesLatestTsqmi: { results: [] } });
    useQuery.mockReturnValue({ handleRepositoryAction: jest.fn(), loadProduct: jest.fn() });
  });

  it('renders repository list correctly', async () => {
    const mockRepositories = { data: { results: [{ id: 1, name: repoName, platform: 'github' }] } };
    productQuery.getAllRepositories.mockResolvedValue(mockRepositories);

    await act(() => {
      const { debug } = render(<RepositoriesTable />)
      debug();
    })

    // Wait for the data fetching to complete
    await waitFor(() => {
      expect(screen.getByText(repoName)).toBeInTheDocument();
    });

    expect(productQuery.getAllRepositories).toHaveBeenCalledWith('1', '3'); // Assuming IDs for org and product
  });

  it('handles search input and filters repositories', async () => {
    const mockRepositories = { data: { results: [{ id: 1, name: repoName, platform: 'github' }] } };
    productQuery.getAllRepositories.mockResolvedValue(mockRepositories);

    render(<RepositoriesTable />);

    await waitFor(() => {
      expect(screen.getByText(repoName)).toBeInTheDocument();
    });

    act(() => {
      const searchInput = document.getElementById('search-bar');
      fireEvent.change(searchInput, { target: { value: 'Repo' } });
    })

    expect(screen.getByText(repoName)).toBeInTheDocument();
  });
});
