import React from 'react';
import { render, screen } from '@testing-library/react';
import { FeatureCard } from '../components/FeatureCard';

describe('FeatureCard', () => {
  it('renderiza badge, titulo, descricao e o children recebido', () => {
    render(
      <FeatureCard
        badge={<span>1</span>}
        title="Titulo do cartao"
        description="Descricao do cartao"
      >
        <button type="button">Acessar</button>
      </FeatureCard>
    );

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Titulo do cartao')).toBeInTheDocument();
    expect(screen.getByText('Descricao do cartao')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Acessar' })).toBeInTheDocument();
  });
});
