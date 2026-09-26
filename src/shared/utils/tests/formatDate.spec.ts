import { formatDate } from '../formatDate';

describe('formatDate util', () => {
  it('deve formatar uma data corretamente no formato longo (default)', () => {
    const date = new Date('2026-05-10T12:00:00Z');

    const formatted = formatDate(date);
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('deve formatar uma data corretamente no formato numérico', () => {
    const date = new Date('2026-05-10T12:00:00Z');
    const formatted = formatDate(date, 'numeric');

    // Pode ser algo como "10/05/2026"
    expect(typeof formatted).toBe('string');
    expect(formatted).toMatch(/10.*05.*2026/);
  });

  it('deve lidar com timestamps em milissegundos', () => {
    const timestamp = 1778338800000;
    const formatted = formatDate(timestamp);
    expect(typeof formatted).toBe('string');
  });

  it('deve lidar com datas em formato string ISO', () => {
    const stringDate = '2026-05-10T12:00:00Z';
    const formatted = formatDate(stringDate);
    expect(typeof formatted).toBe('string');
  });
});
