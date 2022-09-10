import '@testing-library/jest-dom';

import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import EqualizerSingleSlider from '../EqualizerSingleSlider';

jest.mock('@mui/material', () =>
   ({
    ...jest.requireActual('@mui/material'),
    Slider: ({...props}: any) => {
      const { id, name, min, max, onChangeCommitted, onChange } = props;
      return (
        <input
          data-testid={props["data-testid"]}
          type="range"
          id={id}
          name={name}
          min={min}
          max={max}
          onChange={(event) => onChangeCommitted('_', event.target.value)}
          onInput={(event) => onChange('_', (event.target as HTMLInputElement).value)}
        />
      );
    },
  })
);

describe('<EqualizerSingleSlider />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderEqualizerSingleSlider = ({ onChangeCommitted, onChange}: any) => render(
    <EqualizerSingleSlider
      index={1}
      name="Usabilidade"
      value={50}
      disabled={false}
      onChange={onChange}
      onChangeCommitted={onChangeCommitted}
    />
  )

  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = renderEqualizerSingleSlider({})
      expect(tree).toMatchSnapshot();
    });
  });

  describe('Comportamento', () => {
    it('Deve chamar onChange ao movimnetar o slider', () => {
      const onChangeCommittedMock = jest.fn();
      const onChangeMock = jest.fn();

      const {  getByTestId } = renderEqualizerSingleSlider({
        onChangeCommitted: onChangeCommittedMock,
        onChange: onChangeMock
      })

      fireEvent.change(getByTestId('single-slider'), { target: { value: 10 } })
      fireEvent.input(getByTestId('single-slider'), { target: { value: 70 } })

      expect(onChangeCommittedMock).toHaveBeenCalledTimes(2)
      expect(onChangeMock).toHaveBeenCalledWith("70")
    });
  });
});
