import React, { useState } from 'react';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import GaugeSlider from '../GaugeSlider';

const SLIDER_TESTID = 'gauge-slider-id';
const RANGE_INPUT = 'input[type="range"]';

describe('GaugeSlider', () => {
  it('should update values and percentage on change', async () => {
    const setValuesMock = jest.fn();

    const eventMock = {} as React.ChangeEvent<{}>;

    const { getByTestId } = render(
      <GaugeSlider
        initialValues={[0.33, 0.66]}
        min={0}
        max={1}
        values={[0.33, 0.66]}
        setValues={setValuesMock}
        step={0.01}
      />
    );

    const sliderContainer = getByTestId(SLIDER_TESTID);
    expect(sliderContainer).toBeTruthy()

    const sliderInput = await sliderContainer.querySelector(RANGE_INPUT);
    fireEvent.change(sliderInput!, { target: { value: [0.5] } });

    expect(setValuesMock).toHaveBeenCalledWith([0.5, 0.66]);

  });

  it('allows setting the red limit to the minimum value (0)', () => {
    const setValuesMock = jest.fn();

    const { getByTestId } = render(
      <GaugeSlider
        initialValues={[0.33, 0.66]}
        min={0}
        max={1}
        values={[0.33, 0.66]}
        setValues={setValuesMock}
        step={0.01}
      />
    );

    const sliderInput = getByTestId(SLIDER_TESTID).querySelector(RANGE_INPUT);
    fireEvent.change(sliderInput!, { target: { value: 0 } });

    expect(setValuesMock).toHaveBeenCalledWith([0, 0.66]);
  });

  it('renders a mark at each configured limit position (33% and 66%)', () => {
    const setValuesMock = jest.fn();

    const { getByTestId } = render(
      <GaugeSlider
        initialValues={[0.33, 0.66]}
        min={0}
        max={1}
        values={[0.33, 0.66]}
        setValues={setValuesMock}
        step={0.01}
      />
    );

    const lefts = Array.from(
      getByTestId(SLIDER_TESTID).querySelectorAll('.MuiSlider-mark')
    ).map((mark) => parseFloat((mark as HTMLElement).style.left));

    // Os limites vermelho (0.33) e amarelo (0.66) devem aparecer como marcas
    // no trilho, em 33% e 66%. Hoje somem porque sao calculadas em escala 0-100.
    expect(lefts.some((left) => Math.abs(left - 33) < 1)).toBe(true);
    expect(lefts.some((left) => Math.abs(left - 66) < 1)).toBe(true);
  });

  it('exposes an accessible name on each slider thumb', () => {
    const setValuesMock = jest.fn();

    const { getByTestId } = render(
      <GaugeSlider
        initialValues={[0.33, 0.66]}
        min={0}
        max={1}
        values={[0.33, 0.66]}
        setValues={setValuesMock}
        step={0.01}
      />
    );

    const inputs = Array.from(
      getByTestId(SLIDER_TESTID).querySelectorAll(RANGE_INPUT)
    );
    expect(inputs.length).toBeGreaterThan(0);

    inputs.forEach((input) => {
      expect(input).toHaveAccessibleName();
    });
  });

  it('should match snapshot', () => {

    const setValuesMock = jest.fn();

    const eventMock = {} as React.ChangeEvent<{}>;

    const tree = render(
      <GaugeSlider
        initialValues={[0.33, 0.66]}
        min={0}
        max={1}
        values={[0.33, 0.66]}
        setValues={setValuesMock}
        step={0.01}
      />
    );
    expect(tree).toMatchSnapshot();
  });
});
