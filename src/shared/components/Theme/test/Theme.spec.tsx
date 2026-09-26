import React from 'react';
import { render, screen } from '@testing-library/react';
import Theme from ".."; 

describe('Theme Component', () => {
  it('deve encapsular os componentes filhos com o tema sem quebrar', () => {
    render(
      <Theme>
        <div data-testid="child-element">Conteúdo Tematizado</div>
      </Theme>
    );

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
  });
});