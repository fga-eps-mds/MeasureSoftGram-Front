import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PreConfigData } from '@customTypes/preConfig';
import ReferenceValuesForm from '../ReferenceValuesForm';

// Mock de dados de exemplo
const mockConfigPageData: PreConfigData = {
  characteristics: [
    {
      key: 'characteristic_1',
      active: true,
      subcharacteristics: [
        {
          key: 'subcharacteristic_1',
          active: true,
          measures: [
            {
              key: 'measure_1',
              active: true,
              min_threshold: 0,
              max_threshold: 100,
              weight: 0,
              metrics: []
            },
          ],
          weight: 0
        },
      ],
      weight: 0,
      goal: 0
    },
  ],
};

const mockDefaultPageData: PreConfigData = {
  characteristics: [
    {
      key: 'characteristic_1',
      subcharacteristics: [
        {
          key: 'subcharacteristic_1',
          measures: [
            {
              key: 'measure_1',
              min_threshold: 0,
              max_threshold: 100,
              weight: 0,
              metrics: []
            },
          ],
          weight: 0
        },
      ],
      weight: 0,
      goal: 0
    },
  ],
};

const setConfigPageData = jest.fn();

test('should update the measure threshold when input value changes', async () => {
  render(
    <ReferenceValuesForm
      configPageData={mockConfigPageData}
      defaultPageData={mockDefaultPageData}
      setConfigPageData={setConfigPageData}
    />
  );

  // Abrir o primeiro Accordion de característica
  const characteristicAccordion = screen.getByText('characteristics.characteristic_1');
  fireEvent.click(characteristicAccordion);

  // Abrir o Accordion de subcaracterística
  const subcharacteristicAccordion = screen.getByText('subCharacteristics.subcharacteristic_1');
  fireEvent.click(subcharacteristicAccordion);
  screen.debug(undefined, Infinity)
  // Buscar pelo input de min com base no label "measure_1"
  const minInput = screen.getByTestId('min-measures.measure_1').querySelector('input') as HTMLInputElement;
  const maxInput = screen.getByTestId('max-measures.measure_1').querySelector('input') as HTMLInputElement;

  // Disparar evento de mudança no campo min
  fireEvent.change(minInput, { target: { value: '10' } });
  fireEvent.change(maxInput, { target: { value: '90' } });

  await waitFor(() => {
    // Verifica se a função foi chamada
    expect(setConfigPageData).toHaveBeenCalledWith(expect.any(Function));
  });
});
