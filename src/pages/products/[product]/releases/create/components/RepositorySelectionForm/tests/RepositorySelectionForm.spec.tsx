import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { productQuery } from '@services/product';
import RepositorySelectionForm from '../RepositorySelectionForm';

jest.mock('@services/product');

describe('RepositorySelectionForm Component', () => {
  const watchMock = jest.fn();
  const setValueMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve exibir o loading inicialmente e depois renderizar os repositórios', async () => {
    watchMock.mockReturnValue([]);
    (productQuery.getAllRepositories as jest.Mock).mockResolvedValue({
      data: {
        results: [
          { id: 1, name: 'Repo 1', description: 'Desc 1' },
          { id: 2, name: 'Repo 2', description: 'Desc 2' },
        ],
      },
    });

    render(
      <RepositorySelectionForm
        organizationId="org-1"
        productId="prod-1"
        watch={watchMock}
        setValue={setValueMock}
      />
    );

    // Deve exibir o loading inicialmente
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Repo 1')).toBeInTheDocument();
      expect(screen.getByText('Repo 2')).toBeInTheDocument();
    });

    // Como nenhnum repositório estava selecionado, deve selecionar todos por padrão
    expect(setValueMock).toHaveBeenCalledWith('repositories_ids', [1, 2]);
  });

  it('deve lidar com erro na API', async () => {
    watchMock.mockReturnValue([]);
    (productQuery.getAllRepositories as jest.Mock).mockRejectedValue(new Error('Erro'));

    render(
      <RepositorySelectionForm
        organizationId="org-1"
        productId="prod-1"
        watch={watchMock}
        setValue={setValueMock}
      />
    );

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('deve adicionar um repositório ao selecionar', async () => {
    watchMock.mockReturnValue([1]); // Apenas Repo 1 selecionado
    (productQuery.getAllRepositories as jest.Mock).mockResolvedValue({
      data: [
        { id: 1, name: 'Repo 1', description: '' },
        { id: 2, name: 'Repo 2', description: '' },
      ],
    });

    render(
      <RepositorySelectionForm
        organizationId="org-1"
        productId="prod-1"
        watch={watchMock}
        setValue={setValueMock}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Repo 1')).toBeInTheDocument();
    });

    // Como já tem um selecionado, não deve fazer setValue inicial automático
    expect(setValueMock).not.toHaveBeenCalled();

    // Seleciona o Repo 2
    fireEvent.click(screen.getByText('Repo 2'));

    expect(setValueMock).toHaveBeenCalledWith('repositories_ids', [1, 2], { shouldValidate: true });
  });

  it('deve remover um repositório ao desselecionar', async () => {
    watchMock.mockReturnValue([1, 2]);
    (productQuery.getAllRepositories as jest.Mock).mockResolvedValue({
      data: [
        { id: 1, name: 'Repo 1', description: '' },
        { id: 2, name: 'Repo 2', description: '' },
      ],
    });

    render(
      <RepositorySelectionForm
        organizationId="org-1"
        productId="prod-1"
        watch={watchMock}
        setValue={setValueMock}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Repo 1')).toBeInTheDocument();
    });

    // Desseleciona o Repo 1
    fireEvent.click(screen.getByText('Repo 1'));

    expect(setValueMock).toHaveBeenCalledWith('repositories_ids', [2], { shouldValidate: true });
  });
});
