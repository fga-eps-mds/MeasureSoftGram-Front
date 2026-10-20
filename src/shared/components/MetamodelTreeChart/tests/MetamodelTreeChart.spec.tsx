import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MetamodelTreeChart from '../MetamodelTreeChart';
import { QualityModelNode } from '@customTypes/metamodel';

let capturedEvents: any = null;

jest.mock('next/dynamic', () => () => {
  const MockECharts = React.forwardRef(({ onEvents, option }: any, ref: any) => {
    capturedEvents = onEvents;
    return (
      <div data-testid="echarts-mock">
        <button
          type="button"
          data-testid="mock-finish-event"
          onClick={() => onEvents?.finished?.()}
        >
          Finish
        </button>
        <button
          type="button"
          data-testid="mock-node-click"
          onClick={() =>
            onEvents?.click?.({
              data: {
                type: 'measure',
                name: 'Densidade de arquivos não complexos',
                parentPath: 'Maintainability › Modifiability',
                description: 'Arquivos simples',
                weight: 34,
                min_threshold: 0,
                max_threshold: 10,
                children: [{ key: 'complexity', name: 'complexity' }],
              },
              event: { offsetX: 100, offsetY: 200 },
            })
          }
        >
          Click Measure
        </button>
        <button
          type="button"
          data-testid="mock-root-click"
          onClick={() =>
            onEvents?.click?.({
              data: { type: 'tsqmi', name: 'TSQMI', description: 'Nota final do produto', weight: 100, children: [] },
              event: {},
            })
          }
        >
          Click Root
        </button>
        <button
          type="button"
          data-testid="mock-metric-click"
          onClick={() =>
            onEvents?.click?.({
              data: { type: 'metric', name: 'ncloc', description: 'Linhas de código', weight: null, children: [] },
              event: { offsetX: 10, offsetY: 10 },
            })
          }
        >
          Click Metric
        </button>
      </div>
    );
  });
  MockECharts.displayName = 'MockECharts';
  return MockECharts;
});

describe('<MetamodelTreeChart />', () => {
  const sampleTree: QualityModelNode = {
    id: null,
    type: 'tsqmi',
    key: 'tsqmi',
    name: 'TSQMI',
    description: 'Índice de Qualidade',
    weight: 100,
    children: [
      {
        id: 1,
        type: 'characteristic',
        key: 'maintainability',
        name: 'Maintainability',
        description: 'Capacidade de manutenção',
        weight: 50,
        children: [],
      },
    ],
  };

  beforeEach(() => {
    capturedEvents = null;
    jest.clearAllMocks();
  });

  it('não renderiza nada se treeData for null', () => {
    const { container } = render(<MetamodelTreeChart treeData={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renderiza legenda com todos os níveis de entidades', () => {
    render(<MetamodelTreeChart treeData={sampleTree} />);

    expect(screen.getByText('TSQMI')).toBeInTheDocument();
    expect(screen.getByText('Característica')).toBeInTheDocument();
    expect(screen.getByText('Subcaracterística')).toBeInTheDocument();
    expect(screen.getByText('Medida')).toBeInTheDocument();
    expect(screen.getByText('Métrica')).toBeInTheDocument();
    expect(
      screen.getByText("Peso (%) em relação ao nível acima · clique em '+' para abrir um ramo")
    ).toBeInTheDocument();
  });

  it('alterna o botão entre "Expandir tudo" e "Recolher tudo"', () => {
    render(<MetamodelTreeChart treeData={sampleTree} />);

    const toggleButton = screen.getByRole('button', { name: 'Expandir tudo' });
    expect(toggleButton).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.getByRole('button', { name: 'Recolher tudo' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Recolher tudo' }));
    expect(screen.getByRole('button', { name: 'Expandir tudo' })).toBeInTheDocument();
  });

  it('abre o modal detalhado ao clicar em um nó de medida e permite fechá-lo', () => {
    render(<MetamodelTreeChart treeData={sampleTree} />);

    const clickNodeBtn = screen.getByTestId('mock-node-click');
    fireEvent.click(clickNodeBtn);

    expect(screen.getByText('Densidade de arquivos não complexos')).toBeInTheDocument();
    expect(screen.getByText('Medida · Maintainability › Modifiability')).toBeInTheDocument();
    expect(screen.getByText('Valor de referência mínimo:')).toBeInTheDocument();

    // Fecha o modal clicando nele
    const modal = screen.getByText('Densidade de arquivos não complexos').closest('.MuiCard-root');
    expect(modal).toBeInTheDocument();
    fireEvent.click(modal!);

    expect(screen.queryByText('Densidade de arquivos não complexos')).not.toBeInTheDocument();
  });

  it('mostra a descrição ao clicar no TSQMI e numa métrica, sem peso no TSQMI (CA3)', () => {
    render(<MetamodelTreeChart treeData={sampleTree} />);

    fireEvent.click(screen.getByTestId('mock-root-click'));
    expect(screen.getByText('Nota final do produto')).toBeInTheDocument();
    expect(screen.queryByText('100%')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('mock-metric-click'));
    expect(screen.getByText('Linhas de código')).toBeInTheDocument();
  });

  it('posiciona o card perto do nó clicado, dentro da área do gráfico', () => {
    render(<MetamodelTreeChart treeData={sampleTree} />);

    fireEvent.click(screen.getByTestId('mock-node-click'));

    const card = screen.getByText('Densidade de arquivos não complexos').closest('.MuiCard-root') as HTMLElement;
    expect(screen.getByTestId('metamodel-chart-area')).toContainElement(card);
    expect(card).toHaveStyle({ left: '120px', top: '160px' });
  });

  it('executa medição de performance no evento finished (CA8)', () => {
    const onPerf = jest.fn();
    const markMock = jest.fn();
    const measureMock = jest.fn();
    const clearMarksMock = jest.fn();
    const getEntriesByNameMock = jest.fn((name: string) => {
      if (name === 'metamodelo-render-start') return [{ name: 'metamodelo-render-start' }];
      if (name === 'metamodelo-render-time') return [{ duration: 42.3 }];
      return [];
    });

    Object.defineProperty(window, 'performance', {
      writable: true,
      value: {
        mark: markMock,
        measure: measureMock,
        clearMarks: clearMarksMock,
        getEntriesByName: getEntriesByNameMock,
      },
    });

    render(<MetamodelTreeChart treeData={sampleTree} onPerformanceMeasured={onPerf} />);
    expect(markMock).toHaveBeenCalledWith('metamodelo-render-start');

    const finishBtn = screen.getByTestId('mock-finish-event');
    fireEvent.click(finishBtn);

    expect(measureMock).toHaveBeenCalledWith(
      'metamodelo-render-time',
      'metamodelo-render-start',
      'metamodelo-render-end'
    );
    expect(onPerf).toHaveBeenCalledWith(42);
    expect(screen.getByTestId('metamodel-chart-area')).toHaveAttribute('data-render-ms', '42');
    expect(clearMarksMock).toHaveBeenCalledWith('metamodelo-render-start');
    expect(clearMarksMock).toHaveBeenCalledWith('metamodelo-render-end');

    const toggleButton = screen.getByRole('button', { name: 'Expandir tudo' });
    fireEvent.click(toggleButton);
    expect(markMock).toHaveBeenCalledTimes(3);
  });
});
