import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PreConfigData } from '@customTypes/preConfig';
import ModelConfigForm from '../ModelConfigForm';

// Mock para o hook useTranslation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock dos dados de configuração
const mockConfigPageData: PreConfigData = {
  characteristics: [
    {
      key: 'characteristic1',
      weight: 50,
      active: true,
      subcharacteristics: [
        {
          key: 'subCharacteristic1',
          weight: 50,
          active: true,
          measures: [
            {
              key: 'measure1',
              weight: 50,
              active: true,
              metrics: []
            },
          ],
        },
      ],
      goal: 0
    },
  ],
};

describe('ModelConfigForm', () => {
  let mockSetConfigPageData: jest.Mock;
  let mockSetChangeRefValue: jest.Mock;

  beforeEach(() => {
    mockSetConfigPageData = jest.fn();
    mockSetChangeRefValue = jest.fn();
  });

  test('renders the component', () => {
    render(
      <ModelConfigForm
        configPageData={mockConfigPageData}
        setConfigPageData={mockSetConfigPageData}
        changeRefValue={false}
        setChangeRefValue={mockSetChangeRefValue}
      />
    );

    // Verifica se as seções e os acordeões são renderizados
    expect(screen.getAllByText('defineCharacteristics')[0]).toBeInTheDocument();
    expect(screen.getAllByText('defineSubCharacteristics')[0]).toBeInTheDocument();
    expect(screen.getAllByText('defineMeasures')[0]).toBeInTheDocument();

    // Verifica se os elementos específicos da característica, subcaracterística e medida são renderizados
    expect(screen.getAllByText('characteristics.characteristic1')[0]).toBeInTheDocument();
    expect(screen.getAllByText('subCharacteristics.subCharacteristic1')[0]).toBeInTheDocument();
    expect(screen.getAllByText('measures.measure1')[0]).toBeInTheDocument();
  });

  test('calls setConfigPageData when characteristic changes', () => {
    render(
      <ModelConfigForm
        configPageData={mockConfigPageData}
        setConfigPageData={mockSetConfigPageData}
        changeRefValue={false}
        setChangeRefValue={mockSetChangeRefValue}
      />
    );

    const characteristic1Slider = screen.getByTestId('slider-characteristic1').querySelector("input") as HTMLInputElement;

    // Simula a mudança de peso da característica
    fireEvent.change(characteristic1Slider, { target: { value: 70 } });

    expect(mockSetConfigPageData).toHaveBeenCalled();
  });

  test('calls setConfigPageData when subcharacteristic changes', () => {
    render(
      <ModelConfigForm
        configPageData={mockConfigPageData}
        setConfigPageData={mockSetConfigPageData}
        changeRefValue={false}
        setChangeRefValue={mockSetChangeRefValue}
      />
    );

    const subCharacteristic1Slider = screen.getByTestId('slider-subCharacteristic1').querySelector("input") as HTMLInputElement;

    // Simula a mudança de peso da subcaracterística
    fireEvent.change(subCharacteristic1Slider, { target: { value: 30 } });

    expect(mockSetConfigPageData).toHaveBeenCalled();
  });

  test('calls setConfigPageData when measure changes', () => {
    render(
      <ModelConfigForm
        configPageData={mockConfigPageData}
        setConfigPageData={mockSetConfigPageData}
        changeRefValue={false}
        setChangeRefValue={mockSetChangeRefValue}
      />
    );

    const measure1Slider = screen.getByTestId('slider-measure1').querySelector("input") as HTMLInputElement;

    // Simula a mudança de peso da medida
    fireEvent.change(measure1Slider, { target: { value: 20 } });

    expect(mockSetConfigPageData).toHaveBeenCalled();
  });

  test('calls setChangeRefValue when switch is toggled', () => {
    render(
      <ModelConfigForm
        configPageData={mockConfigPageData}
        setConfigPageData={mockSetConfigPageData}
        changeRefValue={false}
        setChangeRefValue={mockSetChangeRefValue}
      />
    );

    // Simula a mudança no switch
    fireEvent.click(screen.getByLabelText('changeRefValues'));

    expect(mockSetChangeRefValue).toHaveBeenCalledWith(true);
  });
});
