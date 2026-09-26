import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LetterAvatar from '../LetterAvatar';

describe('LetterAvatar Component', () => {
  it('deve renderizar a sigla corretamente para um nome composto', () => {
    render(<LetterAvatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('deve renderizar a inicial para um nome único', () => {
    render(<LetterAvatar name="John" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('deve renderizar "?" quando o nome for undefined', () => {
    // Usamos 'as any' para forçar o teste do comportamento de fallback
    render(<LetterAvatar name={undefined as any} />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('deve renderizar o ícone quando fornecido', () => {
    const mockIcon = <span data-testid="test-icon">Icon</span>;
    render(<LetterAvatar name="John Doe" icon={mockIcon} />);
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('não deve renderizar o container do ícone se nenhum ícone for passado', () => {
    render(<LetterAvatar name="John Doe" />);
    // Verifica que não existe nenhum elemento com data-testid de ícone
    expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
  });

  it('deve lidar com nomes com separadores diferentes', () => {
    const { rerender } = render(<LetterAvatar name="John-Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
    
    rerender(<LetterAvatar name="John_Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });
});
