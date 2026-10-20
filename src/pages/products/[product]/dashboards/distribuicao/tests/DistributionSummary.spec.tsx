import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DistributionSummary from '../DistributionSummary';

const summary = { count: 212, min: 1, q1: 3, median: 7, q3: 14, max: 87, mean: 10.43, std_dev: 11.82 };

function rows() {
  return screen.getAllByTestId('summary-row').map((row) => row.textContent);
}

describe('<DistributionSummary />', () => {
  it('mostra o resumo na ordem do protótipo (CA3)', () => {
    render(<DistributionSummary summary={summary} kind="count" outlierCount={8} excludedFiles={9} />);

    expect(screen.getByRole('region', { name: 'Resumo' })).toBeInTheDocument();
    expect(rows()).toEqual([
      'Arquivos analisados212',
      'Mínimo1',
      '1º quartil3',
      'Mediana7',
      '3º quartil14',
      'Máximo87',
      'Média10,4',
      'Desvio padrão11,8',
      'Outliers8'
    ]);
  });

  it('informa quantos arquivos ficaram fora por não terem linhas de código (CA7)', () => {
    render(<DistributionSummary summary={summary} kind="count" outlierCount={8} excludedFiles={9} />);

    expect(screen.getByText('9 arquivos excluídos')).toBeInTheDocument();
    expect(
      screen.getByText('Arquivos sem linhas de código (ncloc = 0) ficam fora, como no cálculo das medidas.')
    ).toBeInTheDocument();
  });

  it('mostra os percentuais com o símbolo e o caso sem exclusões', () => {
    render(<DistributionSummary summary={summary} kind="percent" outlierCount={0} excludedFiles={0} />);

    expect(rows()).toContain('Máximo87%');
    expect(screen.getByText('Nenhum arquivo excluído')).toBeInTheDocument();
  });
});
