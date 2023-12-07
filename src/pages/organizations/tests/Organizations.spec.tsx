import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Organizations from '../Organizations';

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    query: {
      id_organization: '123',
      id_product: '456',
    },
  })),
}));

jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: () => ({
    organizationList: [{ id: 1, name: 'Organization 1' }],
  }),
}));

describe('Organizations Component', () => {
  it('Renderiza corretamente os elementos', () => {
    const { getByTestId } = render(<Organizations />);

    expect(getByTestId('organization-title')).toBeDefined();
    expect(getByTestId('input-nome')).toBeDefined();
    expect(getByTestId('input-descricao')).toBeDefined();
    expect(getByTestId('membros-title')).toBeDefined();
    expect(getByTestId('button-adicionar-membros')).toBeDefined();
  });

  it('Deve corresponder ao Snapshot', () => {
    const tree = render(<Organizations />);
    expect(tree).toMatchSnapshot();
  });
});
