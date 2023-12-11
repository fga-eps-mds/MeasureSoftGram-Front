import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { ProductProvider, useProductContext } from '../ProductProvider';
import { Product } from '@customTypes/product';
import { productQuery } from '@services/product';
import { useOrganizationContext } from '@contexts/OrganizationProvider';

// Mocks necessários
jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: jest.fn(),
}));
jest.mock('@services/product', () => ({
  productQuery: {
    getAllProducts: jest.fn(),
  },
}));

const mockProduct: Product = {
  id: "1",
  name: "MeasureSoftGram",
  description: '',
  github_url: '',
  created_at: '',
  updated_at: '',
  gaugeRedLimit: 0,
  gaugeYellowLimit: 0
};
const mockProducts: Product[] = [mockProduct, /* ...outros produtos... */];
const mockOrganization = { id: 'org-123', /* ...outros dados... */ };


const TestComponent = () => {
  const { currentProduct, setCurrentProduct, productsList, updateProductList } = useProductContext();

  // Renderize os valores ou forneça botões para interagir com o estado (setCurrentProduct, updateProductList)
  // Por exemplo, você pode renderizar o nome do produto atual e um botão para alterá-lo
  return (
    <div>
      <span data-testid="currentProduct">{currentProduct?.name}</span>
      <button onClick={() => setCurrentProduct(mockProduct)}>Set Product</button>
      {/* Outras interações conforme necessário */}
    </div>
  );
};

const TestComponents = () => {
  const { productsList, updateProductList } = useProductContext();

  return (
    <div>
      {productsList && productsList.map((product, index) => (
        <div key={index} data-testid={`product-${index}`}>{product.name}</div>
      ))}
      <button onClick={() => updateProductList(mockProducts)}>Update Products</button>
    </div>
  );
};

describe('ProductProvider', () => {
  beforeEach(() => {
    (useOrganizationContext as jest.Mock).mockReturnValue({
      currentOrganization: mockOrganization,
    });
    (productQuery.getAllProducts as jest.Mock).mockResolvedValue({
      data: { results: mockProducts },
    });
  });

  it('renderiza os filhos corretamente', () => {
    const { getByText } = render(
      <ProductProvider>
        <div>Test Child</div>
      </ProductProvider>
    );
    const testChildElement = getByText('Test Child');
    expect(testChildElement).toBeTruthy();
  });

  it('atualiza o estado currentProduct corretamente', () => {
    const { getByTestId, getByText } = render(
      <ProductProvider>
        <TestComponent />
      </ProductProvider>
    );

    expect(getByTestId('currentProduct').textContent).toBe('');

    act(() => {
      getByText('Set Product').click();
    });

    expect(getByTestId('currentProduct').textContent).toBe(mockProduct.name);
  });


  it('lida com erro ao carregar produtos', async () => {
    (useOrganizationContext as jest.Mock).mockReturnValue({
      currentOrganization: mockOrganization,
    });

    const mockError = new Error('Erro ao carregar produtos');
    (productQuery.getAllProducts as jest.Mock).mockRejectedValue(mockError);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

    render(
      <ProductProvider children={undefined}>
        {/* Elementos filhos, se necessário */}
      </ProductProvider>
    );

    await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith(mockError));

    consoleSpy.mockRestore();
  });

  it('carrega produtos quando currentOrganization é definido', async () => {
    (useOrganizationContext as jest.Mock).mockReturnValue({
      currentOrganization: mockOrganization,
    });

    render(
      <ProductProvider children={undefined}>
        {/* Elementos filhos, se necessário */}
      </ProductProvider>
    );

    await waitFor(() => expect(productQuery.getAllProducts).toHaveBeenCalledWith(mockOrganization.id));
  });

});
