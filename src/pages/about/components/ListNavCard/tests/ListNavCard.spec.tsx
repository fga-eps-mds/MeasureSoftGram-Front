import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ListNavCard from '../ListNavCard';

describe('ListNavCard Component', () => {
  const mockNavListData = ['Section 1', 'Section 2', 'Section 3'];

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar a lista e iniciar com o primeiro item selecionado', () => {
    render(<ListNavCard navListData={mockNavListData} />);

    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('Section 2')).toBeInTheDocument();
    expect(screen.getByText('Section 3')).toBeInTheDocument();

    const icon = screen.getByTestId('EastOutlinedIcon');
    expect(icon).toBeInTheDocument();
  });

  it('deve alterar o item selecionado e chamar scrollIntoView ao clicar', () => {
    const mockScrollIntoView = jest.fn();
    const originalGetElementById = document.getElementById;

    document.getElementById = jest.fn().mockReturnValue({
      scrollIntoView: mockScrollIntoView,
    } as unknown as HTMLElement);

    render(<ListNavCard navListData={mockNavListData} />);

    const secondItem = screen.getByText('Section 2');
    fireEvent.click(secondItem);

    expect(document.getElementById).toHaveBeenCalledWith('Section 2');
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });

    document.getElementById = originalGetElementById;
  });
});
