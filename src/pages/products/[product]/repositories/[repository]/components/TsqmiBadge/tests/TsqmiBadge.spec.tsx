import React from 'react';
import { render, screen } from '@testing-library/react';
import TsqmiBadge from '../TsqmiBadge';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback: string) => fallback
  })
}));

jest.mock('../../CopyBadgeModal', () => ({
  __esModule: true,
  default: () => <div data-testid="copy-badge-modal" />
}));

const mockLatestTSQMI = {
  id: 1,
  value: 0.75,
  created_at: '2026-05-20T00:00:00Z'
};

const mockBadgeUrl = 'http://localhost:8000/organizations/1/products/1/repositories/1/latest-values/tsqmi/badge';
const STALE_WARNING_LABEL = 'Badge desatualizada';

describe('<TsqmiBadge />', () => {
  it('should render the badge image when latestTSQMIBadgeUrl is provided', () => {
    render(
      <TsqmiBadge
        latestTSQMI={mockLatestTSQMI}
        latestTSQMIBadgeUrl={mockBadgeUrl}
      />
    );

    const img = screen.getByAltText('TSQMI Badge');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', mockBadgeUrl);
  });

  it('should return null when latestTSQMIBadgeUrl is empty', () => {
    const { container } = render(
      <TsqmiBadge
        latestTSQMI={mockLatestTSQMI}
        latestTSQMIBadgeUrl=""
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should show CopyBadgeModal by default (showCopyButton=true)', () => {
    render(
      <TsqmiBadge
        latestTSQMI={mockLatestTSQMI}
        latestTSQMIBadgeUrl={mockBadgeUrl}
      />
    );

    expect(screen.getByTestId('copy-badge-modal')).toBeInTheDocument();
  });

  it('should hide CopyBadgeModal when showCopyButton=false', () => {
    render(
      <TsqmiBadge
        latestTSQMI={mockLatestTSQMI}
        latestTSQMIBadgeUrl={mockBadgeUrl}
        showCopyButton={false}
      />
    );

    expect(screen.queryByTestId('copy-badge-modal')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(STALE_WARNING_LABEL)).not.toBeInTheDocument();
  });

  it('should show stale warning icon when analysis is older than 30 days', () => {
    const staleTSQMI = {
      id: 1,
      value: 0.75,
      created_at: '2026-03-01T00:00:00Z' // more than 30 days ago
    };

    render(
      <TsqmiBadge
        latestTSQMI={staleTSQMI}
        latestTSQMIBadgeUrl={mockBadgeUrl}
      />
    );

    expect(screen.getByLabelText(STALE_WARNING_LABEL)).toBeInTheDocument();
  });

  it('should not show stale warning icon when analysis is recent', () => {
    const recentTSQMI = {
      id: 1,
      value: 0.75,
      created_at: new Date().toISOString() // today
    };

    render(
      <TsqmiBadge
        latestTSQMI={recentTSQMI}
        latestTSQMIBadgeUrl={mockBadgeUrl}
      />
    );

    expect(screen.queryByLabelText(STALE_WARNING_LABEL)).not.toBeInTheDocument();
  });

  it('should show stale warning icon when latestTSQMI is null', () => {
    render(
      <TsqmiBadge
        latestTSQMI={null}
        latestTSQMIBadgeUrl={mockBadgeUrl}
      />
    );

    expect(screen.getByLabelText(STALE_WARNING_LABEL)).toBeInTheDocument();
  });
});
