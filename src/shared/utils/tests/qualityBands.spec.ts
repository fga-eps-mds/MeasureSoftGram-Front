import { getQualityBand, QUALITY_BANDS } from '../qualityBands';

describe('QUALITY_BANDS', () => {
  it('cobre de 0 a 1 sem buracos, com as cores e os rótulos da US06.01', () => {
    expect(QUALITY_BANDS.map(({ grade, color, label }) => [grade, color, label])).toEqual([
      ['E', '#D7191C', 'Muito ruim'],
      ['D', '#FE7D37', 'Ruim'],
      ['C', '#DFB317', 'Bom'],
      ['B', '#8CC63F', 'Muito bom'],
      ['A', '#1A9641', 'Ótimo']
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
