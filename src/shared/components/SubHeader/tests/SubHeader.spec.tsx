import '@testing-library/jest-dom';

import React from 'react';
import { render, screen } from '@testing-library/react';

import SubHeader from '../SubHeader';
import { SUB_HEADER } from '../consts';

const { OVERVIEW, MESURES, METRICS } = SUB_HEADER.VALUES;

const BUTTON_TITLE_TYPE = 'h6';

describe('<SubHeader />', () => {
  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(<SubHeader />);
      expect(tree).toMatchSnapshot();
    });
  });

  describe('Comportamento', () => {
    beforeEach(() => {
      render(<SubHeader />);
    });

    describe.each([{ name: OVERVIEW }, { name: MESURES }, { name: METRICS }])('Botões', ({ name }) => {
      it(`Deve renderizar botão ${name}`, () => {
        const button = screen.getByText(name);
        expect(button).toBeDefined();
        expect(button.nodeName.toLowerCase()).toBe(BUTTON_TITLE_TYPE);
      });
    });
  });
});
