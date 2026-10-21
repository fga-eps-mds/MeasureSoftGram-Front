import React from 'react';
import { render } from '@testing-library/react';
import { useRouter } from 'next/router';
import { Breadcrumbs } from '../Breadcrumbs';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('@hooks/useProviderTranslation', () => ({
  useProviderTranslation: () => ({ t: (key: string) => key })
}));

const renderAt = (asPath: string) => {
  (useRouter as jest.Mock).mockReturnValue({ asPath });
  return render(<Breadcrumbs />).container.innerHTML;
};

describe('Breadcrumbs', () => {
  it('monta o mesmo HTML com e sem a barra final, como no HTML gerado no build e no navegador', () => {
    const withoutSlash = renderAt('/products/[product]/dashboards/metamodelo');

    expect(renderAt('/products/[product]/dashboards/metamodelo/')).toBe(withoutSlash);
    expect(renderAt('/products/[product]/dashboards/metamodelo/?release=2')).toBe(withoutSlash);
  });

  it('mostra o último trecho do caminho como página atual, sem link', () => {
    (useRouter as jest.Mock).mockReturnValue({ asPath: '/products/1-3-MeasureSoftGram/repositories/' });

    const { getByText } = render(<Breadcrumbs />);

    expect(getByText('repositories').closest('a')).toBeNull();
    expect(getByText('1-3-MeasureSoftGram').closest('a')?.getAttribute('href')).toBe('/products/1-3-MeasureSoftGram');
  });
});
