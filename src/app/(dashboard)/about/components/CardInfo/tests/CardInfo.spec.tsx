import React from 'react';
import { render, screen } from '@testing-library/react';
import CardInfo from '../CardInfo';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

describe('CardInfo Component', () => {
  const CARD_TITLE = 'Título Principal do Card';
  const CARD_SUBTITLE = 'Subtítulo do Card';
  const CARD_DESCRIPTION = 'Descrição do primeiro elemento';
  const CARD_IMAGE_SRC = 'https://site.com/imagem.png';

  const ORGANIZATION_VIEW_TEXT = 'organization.view-organization';
  const ORGANIZATION_CREATE_TEXT = 'organization.create-organization';
  const PRODUCT_CREATE_TEXT = 'product.create-product';

  it('deve renderizar o título principal e as descrições básicas', () => {
    const mockData = {
      id: 'card-1',
      title: CARD_TITLE,
      elements: [
        {
          title: CARD_SUBTITLE,
          description: CARD_DESCRIPTION,
          imageSrc: CARD_IMAGE_SRC,
        }
      ]
    };

    render(<CardInfo cardData={mockData} />);

    expect(screen.getByText(CARD_TITLE)).toBeInTheDocument();
    expect(screen.getByText(CARD_SUBTITLE)).toBeInTheDocument();
    expect(screen.getByText(CARD_DESCRIPTION)).toBeInTheDocument();

    const image = screen.getByAltText('green iguana');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', CARD_IMAGE_SRC);
  });

  it('deve renderizar ícones React (não-string) e sem título principal', () => {
    const mockData = {
      id: 'card-2',
      elements: [
        {
          title: CARD_SUBTITLE,
          description: CARD_DESCRIPTION,
          imageSrc: <svg data-testid="mock-icon" />,
        }
      ]
    };

    render(<CardInfo cardData={mockData} />);

    expect(screen.queryByText(CARD_TITLE)).not.toBeInTheDocument();
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });

  it('deve renderizar os botões quando a rota for "products"', () => {
    const mockData = {
      id: 'card-3',
      elements: [
        {
          title: 'Rota de Produtos',
          description: 'Desc',
          imageSrc: CARD_IMAGE_SRC,
          routeTo: 'products'
        }
      ]
    };

    render(<CardInfo cardData={mockData} />);

    expect(screen.getByText(ORGANIZATION_VIEW_TEXT)).toBeInTheDocument();
    expect(screen.getByText(ORGANIZATION_CREATE_TEXT)).toBeInTheDocument();
  });

  it('deve renderizar o botão quando a rota for "products/create"', () => {
    const mockData = {
      id: 'card-4',
      elements: [
        {
          title: 'Rota de Criação',
          description: 'Desc',
          imageSrc: CARD_IMAGE_SRC,
          routeTo: 'products/create'
        }
      ]
    };

    render(<CardInfo cardData={mockData} />);

    expect(screen.getByText(PRODUCT_CREATE_TEXT)).toBeInTheDocument();
    expect(screen.queryByText(ORGANIZATION_VIEW_TEXT)).not.toBeInTheDocument();
  });

  it('não deve renderizar botões quando não há rota de ação', () => {
    const mockData = {
      id: 'card-5',
      elements: [
        {
          title: 'Sem Rota',
          description: 'Sem ação',
          imageSrc: CARD_IMAGE_SRC
        }
      ]
    };

    render(<CardInfo cardData={mockData} />);

    expect(screen.queryByText(ORGANIZATION_VIEW_TEXT)).not.toBeInTheDocument();
    expect(screen.queryByText(ORGANIZATION_CREATE_TEXT)).not.toBeInTheDocument();
    expect(screen.queryByText(PRODUCT_CREATE_TEXT)).not.toBeInTheDocument();
  });
});
