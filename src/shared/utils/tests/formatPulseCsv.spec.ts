import { toCsv } from '../exportCsv';
import { PulseRepositoryData } from '../formatPulseChart';
import { PULSE_CSV, formatProductPulseCsv, formatRepositoryPulseCsv } from '../formatPulseCsv';

const row = (id: number, name: string, measurements: PulseRepositoryData['measurements']): PulseRepositoryData => ({
  id,
  name,
  measurements,
  releases: []
});

const lines = (chart: Parameters<typeof toCsv>[0]) => toCsv(chart).split('\r\n');

describe('formatProductPulseCsv', () => {
  const rows = [
    row(1, 'service', [
      { created_at: '2026-10-10T12:00:00Z', value: 0.9 },
      { created_at: '2026-10-01T12:00:00Z', value: 0.55 }
    ]),
    row(2, 'front, web', [{ created_at: '2026-10-05T12:00:00Z', value: 0.1234567 }])
  ];

  it('exporta uma linha por medição, em ordem de data, com o valor sem arredondar e o grau', () => {
    const chart = formatProductPulseCsv(rows);

    expect(chart.name).toBe(PULSE_CSV.pulse);
    expect(lines(chart)).toEqual([
      'Repositório,Data,Valor,Grau',
      'service,2026-10-01T12:00:00Z,0.55,C',
      'service,2026-10-10T12:00:00Z,0.9,A',
      '"front, web",2026-10-05T12:00:00Z,0.1234567,E'
    ]);
  });

  it('fica sem linhas sem medições, para o botão ficar desabilitado', () => {
    expect(formatProductPulseCsv([]).rows).toEqual([]);
  });

  it('não altera a ordem das medições do gráfico', () => {
    formatProductPulseCsv(rows);

    expect(rows[0].measurements[0].value).toBe(0.9);
  });
});

describe('formatRepositoryPulseCsv', () => {
  const rows = [
    row(1, 'Reliability', [
      { created_at: '2026-10-02T00:00:00Z', value: 0.2 },
      { created_at: '2026-10-01T00:00:00Z', value: 0.19999 }
    ]),
    row(2, 'Maintainability', [{ created_at: '2026-10-03T00:00:00Z', value: 1 }])
  ];

  it('exporta a característica, a data, o valor e o grau de cada medição do período', () => {
    const chart = formatRepositoryPulseCsv('MeasureSoftGram-Front', rows);

    expect(chart.name).toBe(PULSE_CSV.pulse);
    expect(lines(chart)).toEqual([
      'Repositório,Característica,Data,Valor,Grau',
      'MeasureSoftGram-Front,Reliability,2026-10-01T00:00:00Z,0.19999,E',
      'MeasureSoftGram-Front,Reliability,2026-10-02T00:00:00Z,0.2,D',
      'MeasureSoftGram-Front,Maintainability,2026-10-03T00:00:00Z,1,A'
    ]);
  });

  it('fica sem linhas quando o período não tem medições', () => {
    expect(formatRepositoryPulseCsv('repo', []).rows).toEqual([]);
  });
});

describe('PULSE_CSV', () => {
  it('nomeia os arquivos dos dois pulsos', () => {
    expect(PULSE_CSV).toEqual({ product: 'produto', repository: 'repositorio', pulse: 'pulso' });
  });
});
