import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CharacteristicsBalanceForm from '../CharacteristicsBalanceForm';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

jest.mock('../../SectionTooltip/SectionTooltip', () => function MockSectionTooltip() {
  return <div data-testid="section-tooltip" />;
});

jest.mock('@components/Equalizer/EqualizerSlider/styles', () => ({
  StyledSlider: (props: any) => <input type="range" {...props} />
}));

describe('CharacteristicsBalanceForm', () => {
  const CHARACTERISTIC_RELIABILITY = 'characteristic-reliability';
  const CHARACTERISTIC_PERFORMANCE = 'characteristic-performance';
  const mockSetDinamicBalance = jest.fn();
  const mockSetConfigPageData = jest.fn();

  const mockConfigPageData = {
    characteristics: [
      { key: 'reliability', name: 'Reliability', weight: 50, goal: 50, active: true },
      { key: 'performance', name: 'Performance', weight: 50, goal: 50, active: true },
      { key: 'maintainability', name: 'Maintainability', weight: 50, goal: 50, active: false }
    ]
  };

  const mockRelations = {
    reliability: {
      "+": ["performance"]
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar os sliders apenas para as características ativas', () => {
    render(
      <CharacteristicsBalanceForm
        dinamicBalance
        setDinamicBalance={mockSetDinamicBalance}
        configPageData={mockConfigPageData as any}
        setConfigPageData={mockSetConfigPageData}
        characteristicRelations={mockRelations}
      />
    );

expect(screen.getByTestId(CHARACTERISTIC_RELIABILITY)).toBeInTheDocument();
      expect(screen.getByTestId(CHARACTERISTIC_PERFORMANCE)).toBeInTheDocument();
    
    expect(screen.queryByTestId('characteristic-maintainability')).not.toBeInTheDocument();
  });

  it('deve alternar o switch de dinamicBalance corretamente', () => {
    render(
      <CharacteristicsBalanceForm
        dinamicBalance
        setDinamicBalance={mockSetDinamicBalance}
        configPageData={mockConfigPageData as any}
        setConfigPageData={mockSetConfigPageData}
        characteristicRelations={mockRelations}
      />
    );

    const switchInput = screen.getByTestId('allowBalanceGoal');
    fireEvent.click(switchInput);

    expect(mockSetDinamicBalance).toHaveBeenCalledWith(false);
  });

  it('deve alterar a meta apenas da característica alvo quando dinamicBalance for TRUE', () => {
    render(
      <CharacteristicsBalanceForm
        dinamicBalance
        setDinamicBalance={mockSetDinamicBalance}
        configPageData={mockConfigPageData as any}
        setConfigPageData={mockSetConfigPageData}
        characteristicRelations={mockRelations}
      />
    );

    const reliabilitySlider = screen.getByTestId(CHARACTERISTIC_RELIABILITY);
    
    fireEvent.change(reliabilitySlider, { target: { value: 80 } });

    expect(mockSetConfigPageData).toHaveBeenCalled();

    const setStateCallback = mockSetConfigPageData.mock.calls.at(-1)[0];
    
    const updatedData = setStateCallback(mockConfigPageData);

    const reliability = updatedData.characteristics.find((c: any) => c.key === 'reliability');
    const performance = updatedData.characteristics.find((c: any) => c.key === 'performance');

    expect(reliability?.goal).toBe(80);
    expect(performance?.goal).toBe(50); 
  });

  it('deve alterar metas relacionadas quando dinamicBalance for FALSE', () => {
    render(
      <CharacteristicsBalanceForm
        dinamicBalance={false}
        setDinamicBalance={mockSetDinamicBalance}
        configPageData={mockConfigPageData as any}
        setConfigPageData={mockSetConfigPageData}
        characteristicRelations={mockRelations}
      />
    );

    const reliabilitySlider = screen.getByTestId(CHARACTERISTIC_RELIABILITY);
    
    fireEvent.change(reliabilitySlider, { target: { value: 70 } });

    expect(mockSetConfigPageData).toHaveBeenCalled();

    const setStateCallback = mockSetConfigPageData.mock.calls.at(-1)[0];
    const updatedData = setStateCallback(mockConfigPageData);

    const reliability = updatedData.characteristics.find((c: any) => c.key === 'reliability');
    const performance = updatedData.characteristics.find((c: any) => c.key === 'performance');

    expect(reliability?.goal).toBe(70);
    expect(performance?.goal).toBe(70); 
  });
});
