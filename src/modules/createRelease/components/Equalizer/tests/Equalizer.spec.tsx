import '@testing-library/jest-dom';

import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import Equalizer from '../Equalizer';

jest.mock('@modules/createRelease/context/useCreateRelease', () => ({
  useCreateReleaseContext: () => ({
    preConfigCharacteristics: ['usability', 'maintainability'],
    handleChangeForm: () => { }
  })
}));

jest.mock('@modules/createRelease/components/Equalizer/hook/useEqualizer', () => (() => ({
  characteristics: [
    {
      id: 1,
      key: 'reliability',
      value: 50,
      correlations: {
        '+': ['maintainability'],
        '-': []
      }
    },
    {
      id: 2,
      key: 'maintainability',
      value: 50,
      correlations: {
        '+': ['reliability'],
        '-': []
      }
    }
  ],
  equalize: jest.fn(),
  addDeltaToChanges: jest.fn(),
  changes: [],
  reset: jest.fn()
})));

jest.mock('@services/balanceMatrix', () => ({
  balanceMatrixService: {
    getBalanceMatrix: () => (Promise.resolve({
      data: {
        result: {
          reliability: {
            '+': ['maintainability'],
            '-': []
          },
          maintainability: {
            '+': ['reliability'],
            '-': []
          }
        }
      }
    }))
  }
}));

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Slider: ({ ...props }: any) => {
    const { id, name, min, max, onChangeCommitted, onChange } = props;
    return (
      <input
        data-testid={props['data-testid']}
        type="range"
        id={id}
        name={name}
        min={min}
        max={max}
        onChange={(event) => onChangeCommitted('_', event.target.value)}
        onInput={(event) => onChange('_', (event.target as HTMLInputElement).value)}
      />
    );
  }
}));

describe('<Equalizer />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderEqualizer = (allowDynamicBalance: boolean = false) =>
    render(
      <Equalizer
        selectedCharacteristics={['reliability', 'maintainability']}
        allowDynamicBalance={allowDynamicBalance}
      />
    );

  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = renderEqualizer();
      expect(tree).toMatchSnapshot();
    });
  });

  describe('Comportamento', () => {
    it('Deve chamar onChange ao movimnetar o slider permitindo balanceamento dinâmico', async () => {
      const { getAllByTestId } = renderEqualizer(true);

      const sliders = getAllByTestId('single-slider');
      const labels = getAllByTestId('label');

      fireEvent.change(sliders[0], { target: { value: 10 } });
      fireEvent.input(sliders[0], { target: { value: 70 } });

      expect(sliders.length).toBe(2);
      expect(labels.length).toBe(2);
    });
    it('Deve chamar onChange ao movimnetar o slider sem permitir balanceamento dinâmico', async () => {
      const { getAllByTestId } = renderEqualizer();

      const sliders = getAllByTestId('single-slider');
      const labels = getAllByTestId('label');

      fireEvent.change(sliders[0], { target: { value: 10 } });
      fireEvent.input(sliders[0], { target: { value: 70 } });

      expect(sliders.length).toBe(2);
      expect(labels.length).toBe(2);
    });
  });
});
