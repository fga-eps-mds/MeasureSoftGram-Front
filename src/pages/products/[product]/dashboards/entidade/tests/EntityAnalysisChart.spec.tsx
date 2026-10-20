import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { EntityAnalysis } from '@customTypes/product';
import EntityAnalysisChart from '../EntityAnalysisChart';

let mockOnEvents: Record<string, (params?: unknown) => void> = {};
jest.mock('next/dynamic', () => () => {
  function MockECharts({ onEvents }: { onEvents: typeof mockOnEvents }) {
    mockOnEvents = onEvents;
    return <div data-testid="echarts-mock" />;
  }
  return MockECharts;
});

const analysis: EntityAnalysis = {
  release: { id: 1, release_name: 'v1.0', start_at: '2026-03-01', end_at: '2026-03-31' },
  level: 'characteristic',
  entity: { key: 'maintainability', name: 'Maintainability' },
  reference: null,
  repositories: [{ id: 1, name: 'api', value: 0.8, created_at: '2026-03-20', children: [] }],
};

describe('<EntityAnalysisChart />', () => {
  it('mede o tempo de desenho depois que os dados chegam', () => {
    render(<EntityAnalysisChart analysis={analysis} showReference onSelectRepository={jest.fn()} />);
    const chart = screen.getByTestId('entity-analysis-chart');

    expect(chart.getAttribute('data-render-ms')).toBeNull();

    act(() => mockOnEvents.finished());

    expect(Number(chart.getAttribute('data-render-ms'))).toBeGreaterThanOrEqual(0);
  });

  it('avisa qual repositório foi clicado e ignora cliques fora das barras', () => {
    const onSelectRepository = jest.fn();
    render(<EntityAnalysisChart analysis={analysis} showReference onSelectRepository={onSelectRepository} />);

    act(() => mockOnEvents.click({ data: { repositoryId: 99 } }));
    act(() => mockOnEvents.click({}));
    expect(onSelectRepository).not.toHaveBeenCalled();

    act(() => mockOnEvents.click({ data: { repositoryId: 1 } }));
    expect(onSelectRepository).toHaveBeenCalledWith(analysis.repositories[0]);
  });
});
