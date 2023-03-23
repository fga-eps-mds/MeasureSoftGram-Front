import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import HistoricalLatestInfos from '../HistoricalLatestInfos';

jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: () => ({
    currentProduct: {
      name: `aoba`
    }
  })
}));

describe('HistoricalLatestInfos component', () => {
  it('should render without errors', () => {
    const { container } = render(<HistoricalLatestInfos checkedOptions={{}} />);

    expect(container).toBeInTheDocument();
  });
});
