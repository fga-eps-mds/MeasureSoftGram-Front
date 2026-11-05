import React from 'react';
import { render } from '@testing-library/react';
import Skeleton from '../Skeleton';
import '@testing-library/jest-dom'; // para usar matchers como .toBeInTheDocument()

describe('Skeleton component', () => {
  test('deve renderizar o componente corretamente', () => {
    const { getByTestId } = render(<Skeleton />);
    expect(getByTestId('skeleton')).toBeInTheDocument();
  });
});
