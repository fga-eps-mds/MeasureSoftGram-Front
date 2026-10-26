import {
  formatQualityBandRange,
  getQualityBand,
  getQualityBandClamped,
  getQualityVisualMapPieces,
  QUALITY_BANDS
} from '../qualityBands';

describe('QUALITY_BANDS', () => {
  it('cobre de 0 a 1 sem buracos, com as cores e os rótulos da US06.01', () => {
    expect(QUALITY_BANDS.map(({ grade, color, label }) => [grade, color, label])).toEqual([
      ['E', '#BE2E0E', 'Muito ruim'],
      ['D', '#F16141', 'Ruim'],
      ['C', '#EBA133', 'Bom'],
      ['B', '#0DC889', 'Muito bom'],
      ['A', '#04724D', 'Ótimo']
    ]);
    QUALITY_BANDS.slice(1).forEach((band, index) => expect(band.min).toBe(QUALITY_BANDS[index].max));
    expect(QUALITY_BANDS[0].min).toBe(0);
    expect(QUALITY_BANDS[QUALITY_BANDS.length - 1].max).toBe(1);
  });
});

describe('getQualityBand', () => {
  it.each([
    [0, 'E'],
    [0.19, 'E'],
    [0.2, 'D'],
    [0.4, 'C'],
    [0.6, 'B'],
    [0.79, 'B'],
    [0.8, 'A'],
    [1, 'A']
  ])('%p fica na faixa %s', (value, grade) => {
    expect(getQualityBand(value)?.grade).toBe(grade);
  });

  it('não classifica valores fora de 0 a 1', () => {
    expect(getQualityBand(-0.1)).toBeUndefined();
    expect(getQualityBand(1.01)).toBeUndefined();
  });
});

describe('getQualityBandClamped', () => {
  it('leva o que passar de 0 a 1 para a faixa da ponta', () => {
    expect(getQualityBandClamped(-0.1).grade).toBe('E');
    expect(getQualityBandClamped(1.2).grade).toBe('A');
    expect(getQualityBandClamped(0.6).grade).toBe('B');
  });
});

describe('formatQualityBandRange', () => {
  it('escreve o intervalo de cada faixa com vírgula decimal', () => {
    expect(QUALITY_BANDS.map(formatQualityBandRange)).toEqual([
      '0,00 a 0,19',
      '0,20 a 0,39',
      '0,40 a 0,59',
      '0,60 a 0,79',
      '0,80 a 1,00'
    ]);
  });
});

describe('getQualityVisualMapPieces', () => {
  it('cobre de 0 a 1 com as mesmas fronteiras das faixas', () => {
    expect(getQualityVisualMapPieces()).toEqual([
      { lt: 0.2, color: '#BE2E0E' },
      { gte: 0.2, lt: 0.4, color: '#F16141' },
      { gte: 0.4, lt: 0.6, color: '#EBA133' },
      { gte: 0.6, lt: 0.8, color: '#0DC889' },
      { gte: 0.8, color: '#04724D' }
    ]);
  });
});
