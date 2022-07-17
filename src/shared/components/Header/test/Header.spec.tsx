import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';

import Header from '../Header';
import { HEADER } from '../Header.consts';

const { BUTTON_OPTIONS } = HEADER.VALUES;

describe('<Header />', () => {
  it('Deve renderizar o header', () => {
    render(<Header />);
  });
  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(<Header />);
      expect(tree).toMatchSnapshot();
    });
  });
  describe('Comportamento', () => {
    describe.each(BUTTON_OPTIONS)('Botões', ({ name }) => {
      it(`Deve renderizar botão ${name}`, () => {
        const { getByText } = render(<Header />);
        const button = getByText(name);
        expect(button).toBeDefined();
      });
    });
  });
});
