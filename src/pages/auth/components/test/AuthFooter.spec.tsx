import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthFooter } from '../AuthFooter'; 

describe('AuthFooter Component', () => {
  it('deve renderizar o rodapé corretamente', () => {
    const mockChangeAuth = jest.fn();
    const { container } = render(
      <AuthFooter text="Texto de teste" link="Link de teste" changeAuthState={mockChangeAuth} />
    );
    
    expect(container.firstChild).toBeInTheDocument();
    
    expect(screen.getByText('Texto de teste')).toBeInTheDocument();
    expect(screen.getByText('Link de teste')).toBeInTheDocument();
  });
});