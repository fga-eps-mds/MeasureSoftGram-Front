import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { toast } from 'react-toastify';
import { downloadCsv, downloadCsvZip } from '@utils/exportCsv';
import ExportCsvButton, { ExportAllCsvButton } from '../ExportCsvButton';

jest.mock('@utils/exportCsv', () => ({ downloadCsv: jest.fn(), downloadCsvZip: jest.fn() }));
jest.mock('react-toastify', () => ({ toast: { error: jest.fn() } }));

const columns = [{ key: 'name' as const, title: 'Nome' }];
const matrix = { name: 'matriz', columns, rows: [{ name: 'R' }] };
const empty = { name: 'vazio', columns, rows: [] };

describe('<ExportCsvButton />', () => {
  beforeEach(() => jest.clearAllMocks());

  it('exporta o CSV do gráfico', () => {
    render(<ExportCsvButton dashboard="relacoes" chart={matrix} />);

    fireEvent.click(screen.getByRole('button', { name: 'Exportar .csv' }));

    expect(downloadCsv).toHaveBeenCalledWith('relacoes', matrix);
  });

  it('fica desabilitado sem dados', () => {
    render(<ExportCsvButton dashboard="relacoes" chart={empty} />);

    expect(screen.getByRole('button', { name: 'Exportar .csv' })).toBeDisabled();
  });
});

describe('<ExportAllCsvButton />', () => {
  beforeEach(() => jest.clearAllMocks());

  it('exporta no .zip só os gráficos com dados e volta a habilitar ao terminar', async () => {
    let finish = () => {};
    (downloadCsvZip as jest.Mock).mockReturnValue(
      new Promise<void>((resolve) => {
        finish = resolve;
      })
    );
    render(<ExportAllCsvButton dashboard="relacoes" charts={[matrix, empty]} />);

    fireEvent.click(screen.getByRole('button', { name: 'Exportar todos (.zip)' }));

    expect(downloadCsvZip).toHaveBeenCalledWith('relacoes', [matrix]);
    expect(screen.getByRole('button', { name: 'Exportando…' })).toBeDisabled();
    finish();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Exportar todos (.zip)' })).toBeEnabled());
  });

  it('avisa quando a exportação falha e volta a habilitar', async () => {
    (downloadCsvZip as jest.Mock).mockRejectedValue(new Error('falhou'));
    render(<ExportAllCsvButton dashboard="relacoes" charts={[matrix]} />);

    fireEvent.click(screen.getByRole('button', { name: 'Exportar todos (.zip)' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Exportar todos (.zip)' })).toBeEnabled());
    expect(toast.error).toHaveBeenCalledWith('Não foi possível gerar o .zip. Tente de novo.');
  });

  it('fica desabilitado se nenhum gráfico tiver dados', () => {
    render(<ExportAllCsvButton dashboard="relacoes" charts={[empty]} />);

    expect(screen.getByRole('button', { name: 'Exportar todos (.zip)' })).toBeDisabled();
  });
});
