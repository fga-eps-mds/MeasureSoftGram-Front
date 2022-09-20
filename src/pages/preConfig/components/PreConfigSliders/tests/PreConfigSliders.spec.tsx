import '@testing-library/jest-dom';

import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import PreConfigSliders from '../PreConfigSliders';
import PRE_CONFIG_SLIDERS from '../consts';

const LABEL = 'SLIDER';
const WEIGHT = 100;

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Slider: (props: any) => <input {...props} />,
  TextField: (props: any) => <input {...props} />
}));

describe('<PreConfigSliders />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(<PreConfigSliders label={LABEL} onChange={jest.fn()} weight={WEIGHT} />);
      expect(tree).toMatchSnapshot();
    });
  });
  describe('Comportamento', () => {
    it('Deve alterar valor ao arrastar slider', () => {
      const onChange = jest.fn();
      const { queryByTestId } = render(<PreConfigSliders label={LABEL} onChange={onChange} weight={WEIGHT} />);

      fireEvent.change(queryByTestId(PRE_CONFIG_SLIDERS.TEST_ID.CONFIG_SLIDER)!, { target: { value: 10 } });

      expect(onChange).toBeCalled();
    });
    it('Deve alterar valor no input', () => {
      const onChange = jest.fn();
      const { queryByTestId } = render(<PreConfigSliders label={LABEL} onChange={onChange} weight={WEIGHT} />);

      fireEvent.change(queryByTestId(PRE_CONFIG_SLIDERS.TEST_ID.CONFIG_INPUT)!, { target: { value: 10 } });

      expect(onChange).toBeCalled();
    });
  });
});
