import '@testing-library/jest-dom';

import React from 'react';
import * as hooks from 'next/router';
import { NextRouter } from 'next/router';
import { render } from '@testing-library/react';

import SubHeader from '../SubHeader';
import { SUB_HEADER } from '../SubHeader.consts';

const { OVERVIEW, MESURES, METRICS } = SUB_HEADER.VALUES;

const BUTTON_TITLE_TYPE = 'h6';

const createMockedRoute = (layer?: string, project?: string) => {
  const query = { layer, project };
  const route = { query } as unknown as NextRouter;
  return route;
};

describe('<SubHeader />', () => {
  beforeEach(() => {
    jest.spyOn(hooks, 'useRouter').mockImplementation(() => createMockedRoute());
  });

  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(<SubHeader />);
      expect(tree).toMatchSnapshot();
    });
  });

  describe('Comportamento', () => {
    describe.each([{ name: OVERVIEW }, { name: MESURES }, { name: METRICS }])('Botões', ({ name }) => {
      it(`Deve renderizar botão ${name}`, () => {
        const { getByText } = render(<SubHeader />);
        const button = getByText(name);
        expect(button).toBeDefined();
        expect(button.nodeName.toLowerCase()).toBe(BUTTON_TITLE_TYPE);
      });
    });
  });
});
