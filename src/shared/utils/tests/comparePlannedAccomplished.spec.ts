import {
  compareCharacteristic,
  comparePlannedAccomplished,
  formatComparisonValue,
} from '../comparePlannedAccomplished';

describe('compareCharacteristic', () => {
  it('calcula Rc = max(0, Rp − Rd) e situação "abaixo" quando o realizado é menor', () => {
    const result = compareCharacteristic('reliability', 0.8, 0.5);

    expect(result.delta).toBeCloseTo(0.3);
    expect(result.rc).toBeCloseTo(0.3);
    expect(result.status).toBe('below');
  });

  it('zera o Rc e indica "acima" quando o realizado supera o planejado', () => {
    const result = compareCharacteristic('security', 0.4, 0.7);

    expect(result.delta).toBeCloseTo(-0.3);
    expect(result.rc).toBe(0);
    expect(result.status).toBe('above');
  });

  it('considera "igual" diferenças menores que meio centésimo', () => {
    expect(compareCharacteristic('security', 0.5, 0.5).status).toBe('equal');
    expect(compareCharacteristic('security', 0.5, 0.504).status).toBe('equal');
    expect(compareCharacteristic('security', 0.5, 0.51).status).toBe('above');
  });

  it('marca como "sem dado" quando não há valor realizado, sem tratar como zero', () => {
    const result = compareCharacteristic('maintainability', 0.6, null);

    expect(result).toEqual({ key: 'maintainability', rp: 0.6, rd: null, rc: null, delta: null, status: 'no-data' });
  });
});

describe('comparePlannedAccomplished', () => {
  const planned = [
    { name: 'reliability', value: 0.7, diff: 0 },
    { name: 'maintainability', value: 0.5, diff: 0 },
    { name: 'security', value: 0.4, diff: 0 },
  ];

  it('segue a ordem do planejado e associa o realizado pelo nome', () => {
    const accomplished = [
      { name: 'security', value: 0.6, diff: 0 },
      { name: 'reliability', value: 0.7, diff: 0 },
    ];

    const result = comparePlannedAccomplished(planned, accomplished);

    expect(result.map((item) => item.key)).toEqual(['reliability', 'maintainability', 'security']);
    expect(result.map((item) => item.status)).toEqual(['equal', 'no-data', 'above']);
  });

  it('retorna todas as características sem dado quando não há realizado', () => {
    const result = comparePlannedAccomplished(planned);

    expect(result.every((item) => item.status === 'no-data')).toBe(true);
    expect(result.map((item) => item.rp)).toEqual([0.7, 0.5, 0.4]);
  });

  it('ignora valores realizados inválidos', () => {
    const result = comparePlannedAccomplished(planned, [
      { name: 'reliability', value: Number.NaN, diff: 0 },
      { name: 'maintainability', value: null as unknown as number, diff: 0 },
    ]);

    expect(result[0].status).toBe('no-data');
    expect(result[1].status).toBe('no-data');
  });
});

describe('formatComparisonValue', () => {
  it('formata com duas casas e evita "-0.00"', () => {
    expect(formatComparisonValue(0.456)).toBe('0.46');
    expect(formatComparisonValue(-0.001)).toBe('0.00');
    expect(formatComparisonValue(-0.25)).toBe('-0.25');
  });

  it('usa o rótulo de vazio quando não há valor', () => {
    expect(formatComparisonValue(null)).toBe('—');
    expect(formatComparisonValue(null, 'Sem dado')).toBe('Sem dado');
  });
});
