import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DistributionSummary from '../DistributionSummary';
import { emptySummary, summary } from './fixtures';

function rows() {
  return screen.getAllByTestId('summary-row').map((row) => row.textContent);
}

describe('<DistributionSummary />', () => {
  it('mostra as 12 estatísticas com duas casas (CA8)', () => {
    render(<DistributionSummary summary={summary} />);

    expect(rows()).toEqual([
      'Análises6',
      'Mínimo0,31',
      'Q1 (1º quartil)0,51',
      'Mediana0,56',
      'Q3 (3º quartil)0,60',
      'Máximo0,90',
      'IQR (Q3 − Q1)0,09',
      'Limite inferior0,38',
      'Limite superior0,73',
      'Discrepantes2',
      'Média0,57',
      'Assimetria0,48'
    ]);
  });

  it('destaca o IQR', () => {
    render(<DistributionSummary summary={summary} />);

    const highlighted = screen.getAllByTestId('summary-row').filter((row) => row.dataset.highlight === 'true');
    expect(highlighted.map((row) => row.textContent)).toEqual(['IQR (Q3 − Q1)0,09']);
  });

  it('explica o IQR, os discrepantes e o sinal da assimetria', () => {
    render(<DistributionSummary summary={summary} />);

    const note = screen.getByTestId('summary-note');
    expect(note).toHaveTextContent('O IQR é a distância entre o Q3 e o Q1');
    expect(note).toHaveTextContent('Discrepantes são as análises fora dos limites');
    expect(note).toHaveTextContent('Assimetria positiva (0,48): a cauda longa fica à direita');
    expect(screen.queryByTestId('skewness-warning')).not.toBeInTheDocument();
  });

  it('com menos de 3 análises, mostra "—" na assimetria e avisa que faltam análises (CA9)', () => {
    const two = { ...emptySummary, count: 2, min: 0.4, q1: 0.425, median: 0.45, q3: 0.475, max: 0.5, mean: 0.45 };
    render(<DistributionSummary summary={two} />);

    expect(rows()[11]).toBe('Assimetria—');
    expect(screen.getByTestId('skewness-warning')).toHaveTextContent(
      'Faltam análises para a assimetria: ela precisa de pelo menos 3, e o período tem 2 análises.'
    );
    // sem a assimetria, a nota explica os dois sinais
    expect(screen.getByTestId('summary-note')).toHaveTextContent('Negativa: à esquerda (valores baixos isolados)');
  });

  it('mostra "—" em tudo o que o Service devolve null', () => {
    render(<DistributionSummary summary={emptySummary} />);

    expect(rows().filter((row) => row?.endsWith('—'))).toHaveLength(10);
  });
});
