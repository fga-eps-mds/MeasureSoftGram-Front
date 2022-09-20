import { act, fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import Filters from '../Filters';

const FILTER_TITLE = 'FILTER_TITLE';
const OPTIONS = ['Op_1', 'Op_2', 'Op_3'];
const CHECKED_OPTIONS = {
  Op_1: false,
  Op_2: false,
  Op_3: true
};

const defaultProps = {
  checkedOptions: CHECKED_OPTIONS,
  updateOptions: jest.fn(),
  filterTitle: FILTER_TITLE,
  options: OPTIONS
};

type defaultPropsType = typeof defaultProps;

const renderFilter = (props: defaultPropsType) => render(<Filters {...props} />);

describe('<Filter />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = renderFilter(defaultProps);
      expect(tree).toMatchSnapshot();
    });
  });
  describe('Comportamento', () => {
    it('Deve chamar updateOptions ao selecionar novo checkbox', () => {
      const updateOptions = jest.fn();
      const register = renderFilter({ ...defaultProps, updateOptions });

      const checkbox = register.queryByTestId(OPTIONS[0]);
      act(() => {
        fireEvent.click(checkbox!, { target: { checked: true } });
      });
      expect(updateOptions).toBeCalled();
    });
  });
});
