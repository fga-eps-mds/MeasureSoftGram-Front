import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import MetamodeloDashboard from '../MetamodeloDashboard';

const mockPush = jest.fn();

jest.mock('next/router', () => ({
  useRouter: () => ({
    query: { product: '1-5-MeasureSoftGram' },
    push: mockPush,
    pathname: '/products/[product]/dashboards/metamodelo',
  }),
}));

jest.mock('@hooks/useRequireAuth', () => () => ({}));

const mockUseRequest = jest.fn();
jest.mock('@hooks/useRequest', () => ({
  useRequest: (req: any) => mockUseRequest(req),
}));

jest.mock('@components/MetamodelTreeChart', () => ({
  MetamodelTreeChart: ({ treeData }: any) => (
    <div data-testid="metamodel-tree-chart">
      <span>{treeData?.name}</span>
    </div>
  ),
}));

const releases = [
  { id: 10, release_name: 'Release 1', start_at: '2026-01-01T00:00:00-03:00', end_at: '2026-02-01T00:00:00-03:00' },
  { id: 20, release_name: 'Release 2', start_at: '2026-02-02T00:00:00-03:00', end_at: '2026-12-31T00:00:00-03:00' },
];

const tree = [
  { id: null, type: 'tsqmi', key: 'tsqmi', name: 'TSQMI', description: 'Nota final', weight: 100, children: [] },
];

const mutate = jest.fn();

type Response = { data?: unknown; isLoading?: boolean; error?: Error };

function mockRequests({ releaseList = { data: releases }, qualityTree = { data: tree } }: {
  releaseList?: Response;
  qualityTree?: Response;
} = {}) {
  mockUseRequest.mockImplementation((request: { url: string } | null) => {
    if (!request) return { data: undefined, isLoading: false, mutate };
    const response = request.url.endsWith('/release/') ? releaseList : qualityTree;
    return { isLoading: false, mutate, ...response };
  });
}

function treeRequests() {
  return mockUseRequest.mock.calls.map(([request]) => request).filter((request) => request?.url.includes('quality-model-tree'));
}

describe('<MetamodeloDashboard />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-03-15T12:00:00-03:00'));
    mockRequests();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('mostra o carregamento enquanto as releases chegam', () => {
    mockRequests({ releaseList: { data: undefined, isLoading: true } });

    render(<MetamodeloDashboard />);

    expect(screen.getByText('Carregando o modelo de qualidade da release…')).toBeInTheDocument();
    expect(screen.queryByTestId('metamodel-tree-chart')).not.toBeInTheDocument();
  });

  it('orienta a planejar uma release quando o produto não tem nenhuma (CA7)', () => {
    mockRequests({ releaseList: { data: [] } });

    render(<MetamodeloDashboard />);

    expect(screen.getByText('Este produto ainda não tem uma release configurada')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Planejar release' }));
    expect(mockPush).toHaveBeenCalledWith('/products/1-5-MeasureSoftGram/releases/create');
  });

  it('abre na release atual e mostra a árvore dela (CA2)', () => {
    render(<MetamodeloDashboard />);

    expect(screen.getByRole('combobox', { name: 'Release' }).textContent).toBe('Release 2 (atual)');
    expect(treeRequests().at(-1)).toEqual({
      url: '/v1/organizations/1/products/5/quality-model-tree/',
      method: 'get',
      params: { release_id: 20 },
    });
    expect(within(screen.getByTestId('metamodel-tree-chart')).getByText('TSQMI')).toBeInTheDocument();
  });

  it('troca a release e busca a árvore dela, sem recarregar a página (CA5)', () => {
    render(<MetamodeloDashboard />);

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Release' }));
    fireEvent.click(screen.getByRole('option', { name: 'Release 1' }));

    expect(treeRequests().at(-1)?.params).toEqual({ release_id: 10 });
    expect(screen.getByRole('combobox', { name: 'Release' }).textContent).toBe('Release 1');
  });

  it('avisa quando a release não tem modelo de qualidade configurado', () => {
    mockRequests({ qualityTree: { data: [] } });

    render(<MetamodeloDashboard />);

    expect(screen.getByText('Esta release não tem um modelo de qualidade configurado')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Planejar release' })).not.toBeInTheDocument();
  });

  it('mostra o erro sem detalhes técnicos e tenta de novo (CA7)', () => {
    mockRequests({ qualityTree: { error: new Error('Request failed with status code 500') } });

    render(<MetamodeloDashboard />);

    expect(screen.getByText('Não foi possível carregar este gráfico')).toBeInTheDocument();
    expect(screen.queryByText(/500/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(mutate).toHaveBeenCalledTimes(2);
  });

  it('mostra o erro quando a lista de releases falha, em vez de dizer que não há release', () => {
    mockRequests({ releaseList: { error: new Error('falhou') } });

    render(<MetamodeloDashboard />);

    expect(screen.getByText('Não foi possível carregar este gráfico')).toBeInTheDocument();
    expect(screen.queryByText('Este produto ainda não tem uma release configurada')).not.toBeInTheDocument();
  });
});
