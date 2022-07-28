import React from 'react'

import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import TabSwitch from '../TabSwitch';
import { TAB_SWITCH_VALUES } from './const';

const { OVERVIEW, MEASURES, METRICS } = TAB_SWITCH_VALUES;

jest.mock("../../Measures", () => ({
  __esModule: true,
  default: () => <h1>Medidas</h1>
}));

jest.mock("../../ProjectContent", () => ({
  __esModule: true,
  default: () => <h1>Overview</h1>
}));

describe('<TabSwitch />', () => {
  describe.each([{ tab: OVERVIEW }, { tab: MEASURES }, { tab: METRICS }])('Tabs', ({ tab }) => {
    it(`Deve renderizar tab ${tab.title}`, () => {
        const { getByText } = render(<TabSwitch layer={tab.route} />);

        expect(getByText(tab.title)).toBeInTheDocument();
      });
    });
});
