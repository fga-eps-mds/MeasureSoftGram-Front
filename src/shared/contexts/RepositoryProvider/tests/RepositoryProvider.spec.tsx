import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { RepositoryProvider, useRepositoryContext } from '@contexts/RepositoryProvider';

describe('RepositoryContext', () => {
  afterEach(cleanup);

  it('should render RepositoryProvider correctly with children', () => {
    const { getByTestId } = render(
      <RepositoryProvider>
        <div data-testid="child">Child</div>
      </RepositoryProvider>
    );
    expect(getByTestId('child').textContent).toBe('Child');
  });

  it('should return correct context values from useRepositoryContext', () => {
    const Child: React.FC = () => {
      const {
        currentRepository,
        setCurrentRepository,
        repositoryList,
        setRepositoryList,
        characteristics,
        setCharacteristics,
        subCharacteristics,
        setSubCharacteristics,
        measures,
        setMeasures,
        metrics,
        setMetrics,
        historicalTSQMI,
        setHistoricalTSQMI
      } = useRepositoryContext();

      return (
        <div data-testid="child">
          <p data-testid="currentRepository">{currentRepository}</p>
          <p data-testid="repositoryList">{repositoryList}</p>
          <p data-testid="characteristics">{characteristics}</p>
          <p data-testid="subCharacteristics">{subCharacteristics}</p>
          <p data-testid="measures">{measures}</p>
          <p data-testid="metrics">{metrics}</p>
          <p data-testid="historicalTSQMI">{historicalTSQMI}</p>
        </div>
      );
    };

    const { getByTestId } = render(
      <RepositoryProvider>
        <Child />
      </RepositoryProvider>
    );

    expect(getByTestId('currentRepository').textContent).toBe('');
    expect(getByTestId('repositoryList').textContent).toBe('');
    expect(getByTestId('characteristics').textContent).toBe('');
    expect(getByTestId('subCharacteristics').textContent).toBe('');
    expect(getByTestId('measures').textContent).toBe('');
    expect(getByTestId('metrics').textContent).toBe('');
    expect(getByTestId('historicalTSQMI').textContent).toBe('');
  });
});
