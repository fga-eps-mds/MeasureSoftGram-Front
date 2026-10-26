import JSZip from 'jszip';
import { csvFileName, downloadCsv, downloadCsvZip, toCsv } from '@utils/exportCsv';

type Row = { name: string; value: number | null; ok: boolean };

const columns = [
  { key: 'name' as const, title: 'Nome' },
  { key: 'value' as const, title: 'Valor' },
  { key: 'ok' as const, title: 'Ok' }
];

function readBlob<T extends string | ArrayBuffer>(blob: Blob, as: 'text' | 'buffer'): Promise<T> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as T);
    if (as === 'text') reader.readAsText(blob);
    else reader.readAsArrayBuffer(blob);
  });
}

describe('exportCsv', () => {
  const createObjectURL = jest.fn<string, [Blob]>(() => 'blob:csv');
  const revokeObjectURL = jest.fn();
  let click: jest.SpyInstance<void, [], HTMLAnchorElement>;

  beforeAll(() => {
    Object.assign(URL, { createObjectURL, revokeObjectURL });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // o .zip é gerado de forma assíncrona: os timers continuam andando
    jest.useFakeTimers({ now: new Date(2026, 9, 23, 10), advanceTimers: true });
    click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  // o link clicado é o this de cada chamada
  const downloadedFiles = () => click.mock.contexts.map((link) => link.download);

  afterEach(() => {
    jest.useRealTimers();
    click.mockRestore();
  });

  describe('toCsv', () => {
    it('separa por vírgula, com o cabeçalho e os valores sem arredondar', () => {
      const rows: Row[] = [{ name: 'Reliability', value: 0.928211, ok: true }];

      expect(toCsv({ columns, rows })).toBe('Nome,Valor,Ok\r\nReliability,0.928211,true');
    });

    it('escapa vírgula, aspas e quebra de linha e deixa vazio o valor nulo', () => {
      const rows: Row[] = [
        { name: 'a, b', value: null, ok: false },
        { name: 'diz "oi"', value: 1, ok: true },
        { name: 'linha\nnova', value: -0.5, ok: true }
      ];

      expect(toCsv({ columns, rows }).split('\r\n')).toEqual([
        'Nome,Valor,Ok',
        '"a, b",,false',
        '"diz ""oi""",1,true',
        '"linha\nnova",-0.5,true'
      ]);
    });
  });

  it('nomeia o arquivo com o dashboard, o gráfico e a data', () => {
    expect(csvFileName('relacoes', 'matriz-correlacao')).toBe('msgram-relacoes-matriz-correlacao-2026-10-23.csv');
  });

  it('baixa o CSV do gráfico e libera o link', async () => {
    downloadCsv('relacoes', { name: 'matriz', columns, rows: [{ name: 'R', value: 1, ok: true }] });

    expect(downloadedFiles()).toEqual(['msgram-relacoes-matriz-2026-10-23.csv']);
    const blob = createObjectURL.mock.calls[0][0];
    expect(blob.type).toBe('text/csv;charset=utf-8');
    expect(await readBlob<string>(blob, 'text')).toBe('Nome,Valor,Ok\r\nR,1,true');
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:csv');
  });

  it('junta num .zip um CSV por gráfico', async () => {
    await downloadCsvZip('relacoes', [
      { name: 'matriz', columns, rows: [{ name: 'R', value: 1, ok: true }] },
      { name: 'bolhas', columns, rows: [{ name: 'M', value: 0.5, ok: false }] }
    ]);

    expect(downloadedFiles()).toEqual(['msgram-relacoes-2026-10-23.zip']);
    const zip = await JSZip.loadAsync(await readBlob<ArrayBuffer>(createObjectURL.mock.calls[0][0], 'buffer'));
    expect(Object.keys(zip.files)).toEqual([
      'msgram-relacoes-matriz-2026-10-23.csv',
      'msgram-relacoes-bolhas-2026-10-23.csv'
    ]);
    expect(await zip.file('msgram-relacoes-bolhas-2026-10-23.csv')?.async('string')).toBe(
      'Nome,Valor,Ok\r\nM,0.5,false'
    );
  });
});
