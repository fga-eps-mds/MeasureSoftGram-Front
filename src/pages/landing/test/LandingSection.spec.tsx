import React from 'react';
import { render, screen } from '@testing-library/react';
import { LandingSection } from '../components/LandingSection';

describe('LandingSection', () => {
  it('renderiza titulo, subtitulo e os cartoes recebidos como children', () => {
    const { container } = render(
      <LandingSection
        id="secao-exemplo"
        title="Titulo da secao"
        subtitle="Subtitulo da secao"
      >
        <div data-testid="card-filho">conteudo do cartao</div>
      </LandingSection>
    );

    expect(screen.getByText('Titulo da secao')).toBeInTheDocument();
    expect(screen.getByText('Subtitulo da secao')).toBeInTheDocument();
    expect(screen.getByTestId('card-filho')).toBeInTheDocument();

    const section = container.querySelector('section');
    expect(section).toHaveAttribute('id', 'secao-exemplo');
  });
});
