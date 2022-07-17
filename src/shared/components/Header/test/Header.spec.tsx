import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';

import Header from '../Header';
import { HEADER } from '../Header.consts';

const { BUTTON_OPTIONS, IMAGE_SOURCE } = HEADER.VALUES;
const BUTTON_TYPE = 'button';

describe('<Header />', () => {
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
        expect(button.nodeName.toLowerCase()).toBe(BUTTON_TYPE);
      });
    });
    describe('Logo', () => {
      it('Deve renderizar a logo', () => {
        const { getByRole } = render(<Header />);
        const image = getByRole('img');
        expect(image).toBeDefined();
        expect(image).toHaveAttribute('src', IMAGE_SOURCE);
      });
    });
  });
});
