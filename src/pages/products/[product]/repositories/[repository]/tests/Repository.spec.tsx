import React from 'react';
import { render } from '@testing-library/react';

import { OrganizationProvider } from '@contexts/OrganizationProvider';
import Repository from '../Repository';

jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: () => ({
    currentProduct: {
      name: `aoba`
    }
  })
}));

jest.mock('@contexts/RepositoryProvider', () => ({
  useRepositoryContext: () => ({
    latestTSQMI: { id: 1, value: 0.75, created_at: new Date().toISOString() },
    latestTSQMIBadgeUrl: 'http://localhost:8000/organizations/1/products/1/repositories/1/latest-values/tsqmi/badge'
  })
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: () => jest.fn()
  })
}));

describe('<Repository />', () => {
  // O TsqmiBadge compara created_at do mock contra Date.now() pra decidir se a
  // analise esta "stale" (> 30 dias). Sem fixar o relogio, o snapshot passa a
  // renderizar o alerta de stale assim que a data real ultrapassa 30 dias do
  // created_at do mock, quebrando o teste com o tempo. Fixamos o agora num
  // ponto dentro da janela pra manter o render deterministico.
  beforeAll(() => {
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2026-05-25T00:00:00Z').getTime());
  });

  afterAll(() => {
    (Date.now as jest.Mock).mockRestore();
  });

  it('Should render correctly', () => {
    const { container } = render(
      <OrganizationProvider>
        <Repository />
      </OrganizationProvider>
    );

    Array.from(container.getElementsByClassName('echarts-for-react')).forEach((chart) => {
      chart.setAttribute('_echarts_instance_', 'ec_123');
    });

    expect(container).toMatchSnapshot();
  });
});
