import React from 'react';
import { render, screen } from '@testing-library/react';
import CharacteristicsBadges from '../CharacteristicsBadges';

const mockBadgeUrls = {
  reliability: 'http://localhost:8000/organizations/1/products/1/repositories/1/latest-values/characteristics/reliability/badge/',
  maintainability: 'http://localhost:8000/organizations/1/products/1/repositories/1/latest-values/characteristics/maintainability/badge/'
};

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback
  })
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('@contexts/RepositoryProvider', () => ({
  useRepositoryContext: () => ({
    characteristicBadgeUrls: mockBadgeUrls
  })
}));

describe('<CharacteristicsBadges />', () => {
  it('should render badges for each characteristic', () => {
    render(<CharacteristicsBadges />);

    expect(screen.getByAltText('reliability Badge')).toBeInTheDocument();
    expect(screen.getByAltText('maintainability Badge')).toBeInTheDocument();
  });

  it('should render the title', () => {
    render(<CharacteristicsBadges />);

    expect(screen.getByText('Badges de Características')).toBeInTheDocument();
  });

  it('should render copy buttons for each characteristic', () => {
    render(<CharacteristicsBadges />);

    const copyButtons = screen.getAllByRole('button');
    expect(copyButtons).toHaveLength(2);
  });
});

