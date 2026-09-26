import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import ProductsCreation from '../ProductsCreation';

const mockPush = jest.fn();
const mockUseRouter = {
  query: {
    id_organization: ['123'],
    id_product: '',
  },
  push: mockPush,
};

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => mockUseRouter),
}));

jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: () => ({
    organizationList: [{ id: 123, name: 'Organization 1' }],
    setCurrentOrganizations: jest.fn(),
  }),
}));

jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: jest.fn(() => ({
    currentProduct: { id: '456', name: 'mocked' },
    setCurrentProduct: jest.fn(),
    loadAllProducts: jest.fn().mockResolvedValue(true),
  })),
}));

const mockCreateProduct = jest.fn();
const mockGetProductById = jest.fn();
const mockUpdateProduct = jest.fn();

jest.mock('../../hooks/useProductQuery', () => ({
  useProductQuery: () => ({
    createProduct: mockCreateProduct,
    getProductById: mockGetProductById,
    updateProduct: mockUpdateProduct,
  }),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ProductsCreation Component', () => {
  const originalLocation = window.location;

  const nameInputTestId = 'name-input';
  const newProductTitle = 'Produto Novo';
  const toastNameExists = 'toast.name-exists';
  const editingProductTitle = 'Produto Editando';
  const editingProductDesc = 'Desc Editando';

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.query = {
      id_organization: ['123'],
      id_product: '',
    };
    delete (window as any).location;
    window.location = { href: '', reload: jest.fn() } as any;
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it('renders the "Nome" field', () => {
    render(<ProductsCreation />);
    const nameField = screen.getByTestId(nameInputTestId);
    expect(nameField).toBeDefined();
  });

  it('renders the "Organização" field', () => {
    render(<ProductsCreation />);
    const orgField = screen.getByTestId('org-input');
    expect(orgField).toBeDefined();
  });

  it('renders the "Descrição" field', () => {
    render(<ProductsCreation />);
    const descriptionField = screen.getByTestId('description-input');
    expect(descriptionField).toBeDefined();
  });

  it('Deve corresponder ao Snapshot', () => {
    const tree = render(<ProductsCreation />);
    expect(tree).toMatchSnapshot();
  });

  it('deve submeter o formulário de criação com sucesso', async () => {
    mockCreateProduct.mockResolvedValue({ type: 'success' });
    render(<ProductsCreation />);

    const nameInput = screen.getByTestId(nameInputTestId).querySelector('input')!;
    const descInput = screen.getByTestId('description-input').querySelector('textarea')!;

    fireEvent.change(nameInput, { target: { value: newProductTitle } });
    fireEvent.change(descInput, { target: { value: 'Desc Novo' } });

    const submitButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateProduct).toHaveBeenCalledWith({
        name: newProductTitle,
        description: 'Desc Novo',
        organizationId: 123,
      });
      expect(toast.success).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/products');
    });
  });

  it('deve exibir toast.error se a criação de produto falhar com erro com mensagem ja existente', async () => {
    mockCreateProduct.mockResolvedValue({
      type: 'error',
      error: { message: toastNameExists },
    });
    render(<ProductsCreation />);

    const nameInput = screen.getByTestId(nameInputTestId).querySelector('input')!;
    fireEvent.change(nameInput, { target: { value: newProductTitle } });

    const submitButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(toastNameExists);
    });
  });

  it('deve exibir toast.error se a criação de produto falhar com outro erro', async () => {
    mockCreateProduct.mockResolvedValue({
      type: 'error',
      error: { message: 'other' },
    });
    render(<ProductsCreation />);

    const nameInput = screen.getByTestId(nameInputTestId).querySelector('input')!;
    fireEvent.change(nameInput, { target: { value: newProductTitle } });

    const submitButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('toast.error-create');
    });
  });

  it('deve capturar erro no catch se createProduct lançar exceção', async () => {
    mockCreateProduct.mockRejectedValue(new Error('Create Error'));
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    render(<ProductsCreation />);

    const nameInput = screen.getByTestId(nameInputTestId).querySelector('input')!;
    fireEvent.change(nameInput, { target: { value: newProductTitle } });

    const submitButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });
    spy.mockRestore();
  });

  it('deve rodar em modo de edição se id_product estiver na query', async () => {
    mockUseRouter.query = {
      id_organization: ['123'],
      id_product: '456',
    };
    mockGetProductById.mockResolvedValue({
      type: 'success',
      value: {
        name: editingProductTitle,
        description: editingProductDesc,
        organizationId: 123,
      },
    });

    render(<ProductsCreation />);

    await screen.findByDisplayValue(editingProductTitle);

    expect(mockGetProductById).toHaveBeenCalledWith(['123'], '456');
    const nameInput = screen.getByTestId(nameInputTestId).querySelector('input')!;
    expect(nameInput.value).toBe(editingProductTitle);
  });

  it('deve capturar erro no catch se getProductById lançar exceção', async () => {
    mockUseRouter.query = {
      id_organization: ['123'],
      id_product: '456',
    };
    mockGetProductById.mockRejectedValue(new Error('Fetch Error'));
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});

    render(<ProductsCreation />);

    await waitFor(() => {
      expect(spy).toHaveBeenCalled();
    });
    spy.mockRestore();
  });

  it('deve atualizar o produto com sucesso em modo de edição', async () => {
    mockUseRouter.query = {
      id_organization: ['123'],
      id_product: '456',
    };
    mockGetProductById.mockResolvedValue({
      type: 'success',
      value: {
        name: editingProductTitle,
        description: editingProductDesc,
        organizationId: 123,
      },
    });
    mockUpdateProduct.mockResolvedValue({ type: 'success' });

    render(<ProductsCreation />);

    await screen.findByDisplayValue(editingProductTitle);

    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateProduct).toHaveBeenCalledWith('456', {
        name: editingProductTitle,
        description: editingProductDesc,
        organizationId: 123,
      });
      expect(toast.success).toHaveBeenCalledWith('toast.success-edit');
    });
  });

  it('deve tratar erro de edição com erro com mensagem ja existente', async () => {
    mockUseRouter.query = {
      id_organization: ['123'],
      id_product: '456',
    };
    mockGetProductById.mockResolvedValue({
      type: 'success',
      value: {
        name: editingProductTitle,
        description: editingProductDesc,
        organizationId: 123,
      },
    });
    mockUpdateProduct.mockResolvedValue({
      type: 'error',
      error: { message: toastNameExists },
    });

    render(<ProductsCreation />);

    await screen.findByDisplayValue(editingProductTitle);

    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(toastNameExists);
    });
  });

  it('deve tratar erro de edição com outro erro', async () => {
    mockUseRouter.query = {
      id_organization: ['123'],
      id_product: '456',
    };
    mockGetProductById.mockResolvedValue({
      type: 'success',
      value: {
        name: editingProductTitle,
        description: editingProductDesc,
        organizationId: 123,
      },
    });
    mockUpdateProduct.mockResolvedValue({
      type: 'error',
      error: { message: 'other' },
    });

    render(<ProductsCreation />);

    await screen.findByDisplayValue(editingProductTitle);

    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('toast.error-edit');
    });
  });

  it('deve alterar o organizationId no formulário', async () => {
    render(<ProductsCreation />);
    const selectWrapper = screen.getByTestId('org-input').querySelector('.MuiSelect-select')!;
    fireEvent.mouseDown(selectWrapper);

    const menuItem = await screen.findByRole('option', { name: 'Organization 1' });
    fireEvent.click(menuItem);

    expect(selectWrapper).toBeDefined();
  });

  it('deve voltar para a listagem ao clicar no botão de voltar', () => {
    render(<ProductsCreation />);
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);
    expect(mockPush).toHaveBeenCalledWith('/products');
  });
});
