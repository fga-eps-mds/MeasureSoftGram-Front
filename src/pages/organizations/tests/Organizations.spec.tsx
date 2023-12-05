import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Organizations from '../Organizations'; // Substitua o caminho correto para o componente

describe('Organizations Component', () => {
  it('Renderiza corretamente os elementos', () => {
    const { getByTestId } = render(<Organizations />);

    expect(getByTestId('organization-title')).toBeInTheDocument();
    expect(getByTestId('input-nome')).toBeInTheDocument();
    expect(getByTestId('input-descricao')).toBeInTheDocument();
    expect(getByTestId('membros-title')).toBeInTheDocument();
    expect(getByTestId('button-adicionar-membros')).toBeInTheDocument();
  });

  it('Adiciona membros ao clicar no botão "Adicionar Membros"', () => {
    const { getByTestId } = render(<Organizations />);

    fireEvent.click(getByTestId('button-adicionar-membros'));
    expect(getByTestId('modal-title')).toBeInTheDocument();

    const addButton = getByTestId('button-adicionar');
    fireEvent.click(addButton);
  });

  it('Submete o formulário ao clicar em "Criar" ou "Salvar"', () => {
    const { getByTestId } = render(<Organizations />);

    fireEvent.change(getByTestId('input-nome'), { target: { value: 'Nova Organização' } });
    fireEvent.change(getByTestId('input-descricao'), { target: { value: 'Descrição da nova organização' } });

    fireEvent.click(getByTestId('button-submit'));
  });

});
