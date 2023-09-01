import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ThresholdConfig from '../ThresholdConfig';

interface TestingComponentProps {
  onChange: (min: number, max: number, key: string) => void;
  label: string;
}

const TestingComponent = ({ onChange, label }: TestingComponentProps) => (
  <div>
    <input
      type='number'
      data-testid='threshold-slider'
      onChange={(e) => onChange(Number(e.target.value), Number(e.target.value), label)}
    />
  </div>);

jest.mock('@modules/createRelease/components/ThresholdSlider/ThresholdSlider', () => TestingComponent);

jest.mock('@modules/createRelease/context/useCreateRelease', () => ({
  useCreateReleaseContext: () => ({
    setCurrentConfig: jest.fn(),
  })
}));

describe('<ThresholdConfig />', () => {
  const data = [
    {
      key: 'characteristic1',
      weight: 100,
      subcharacteristics: [
        {
          key: 'subcharacteristic1',
          weight: 70,
          measures: [
            { key: 'measure1', min_threshold: 10, max_threshold: 20, weight: 1 },
            { key: 'measure2', min_threshold: 30, max_threshold: 40, weight: 2 },
          ],
        },
        {
          key: 'subcharacteristic2',
          weight: 30,
          measures: [
            { key: 'measure3', min_threshold: 50, max_threshold: 60, weight: 3 },
            { key: 'measure4', min_threshold: 70, max_threshold: 80, weight: 4 },
          ]
        }
      ],
    },
  ];

  describe("Snapshot", () => {
    it('Deve chamar a função setCheckboxValues ao clicar na checkbox', () => {
      const setCheckboxValues = jest.fn();

      const tree = render(
        <ThresholdConfig
          data={data}
          checkboxValues={['measure1']}
          setCheckboxValues={setCheckboxValues}
          tabs={['subcharacteristic1']}
        />
      );

      expect(tree).toMatchSnapshot();
    })
  });

  it('Deve renderizar as checkboxes corretamente', () => {
    const setCheckboxValues = jest.fn();

    const { getByText } = render(
      <ThresholdConfig
        data={data}
        checkboxValues={['measure1']}
        setCheckboxValues={setCheckboxValues}
        tabs={['subcharacteristic1']}
      />
    );
    const checkboxMeasure1 = getByText('measure1');
    const checkboxMeasure2 = getByText('measure2');

    expect(checkboxMeasure1).toBeDefined();
    expect(checkboxMeasure2).toBeDefined();
    fireEvent.click(checkboxMeasure1);
    fireEvent.click(checkboxMeasure2);
    expect(setCheckboxValues).toBeCalled();
  });

  it('Deve chamar a função onChange ao alterar os sliders', () => {
    const { getByTestId } = render(
      <ThresholdConfig
        data={data}
        checkboxValues={['measure1']}
        setCheckboxValues={jest.fn()}
        tabs={['subcharacteristic1']}
      />
    );

    const sliderInput = getByTestId('threshold-slider');
    expect(sliderInput).toBeDefined();
    fireEvent.change(sliderInput, { target: { value: 50 } })
    fireEvent.change(sliderInput, { target: { value: -50 } })
  });

  it('Deve clicar na tab', () => {
    const { getByText } = render(
      <ThresholdConfig
        data={data}
        checkboxValues={['measure1']}
        setCheckboxValues={jest.fn()}
        tabs={['subcharacteristic1', 'subcharacteristic2']}
      />
    );

    const subcharacteristicTab = getByText('subcharacteristic2');
    expect(subcharacteristicTab).toBeDefined();
    fireEvent.click(subcharacteristicTab);
  });

});
