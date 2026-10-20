import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardCard from '../DashboardCard';

describe('<DashboardCard />', () => {
  it('mostra o conteúdo e a ação do cabeçalho quando há dados', () => {
    render(
      <DashboardCard title="Radar" status="ready" headerAction={<span>seletor</span>}>
        <div>gráfico</div>
      </DashboardCard>
    );

    expect(screen.getByRole('region', { name: 'Radar' })).toBeInTheDocument();
    expect(screen.getByText('gráfico')).toBeInTheDocument();
    expect(screen.getByText('seletor')).toBeInTheDocument();
  });

  it('mostra o selo e o esqueleto enquanto carrega', () => {
    render(
      <DashboardCard
        title="Radar"
        status="loading"
        loadingContent={<div>esqueleto</div>}
        headerAction={<span>seletor</span>}
      >
        <div>gráfico</div>
      </DashboardCard>
    );

    expect(screen.getByText('Carregando')).toBeInTheDocument();
    expect(screen.getByText('esqueleto')).toBeInTheDocument();
    expect(screen.getByText('Carregando os dados da release…')).toBeInTheDocument();
    expect(screen.queryByText('gráfico')).not.toBeInTheDocument();
    expect(screen.queryByText('seletor')).not.toBeInTheDocument();
  });

  it('explica o que fazer quando não há dados', () => {
    render(
      <DashboardCard
        title="Radar"
        status="empty"
        emptyDescription="Rode a coleta."
        emptyAction={<a href="#guia">guia</a>}
      />
    );

    expect(screen.getByText('Sem dados')).toBeInTheDocument();
    expect(screen.getByText('Ainda não há análises nesta release')).toBeInTheDocument();
    expect(screen.getByText('Rode a coleta.')).toBeInTheDocument();
    expect(screen.getByText('guia')).toBeInTheDocument();
  });

  it('mostra o erro sem detalhes técnicos e tenta de novo', () => {
    const onRetry = jest.fn();
    render(<DashboardCard title="Radar" status="error" onRetry={onRetry} />);

    expect(screen.getByText('Erro')).toBeInTheDocument();
    expect(screen.getByText('Não foi possível carregar este gráfico')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(onRetry).toHaveBeenCalled();
  });
});
