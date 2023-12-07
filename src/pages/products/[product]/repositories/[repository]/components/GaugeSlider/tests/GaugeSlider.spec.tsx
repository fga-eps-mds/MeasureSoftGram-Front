import React, { useState } from 'react';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import GaugeSlider from '../GaugeSlider';


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

    const sliderContainer = getByTestId('gauge-slider-id');
    expect(sliderContainer).toBeTruthy()

    const sliderInput = await sliderContainer.querySelector('input[type="range"]');
    fireEvent.change(sliderInput!, { target: { value: [0.5] } });

    expect(setValuesMock).toHaveBeenCalledWith([0.5, 0.66]);

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
