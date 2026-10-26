import { formatEntityValue, NO_DATA_LABEL } from '../entityLevels';

describe('formatEntityValue', () => {
  it('mostra "sem dado" em vez de zero quando não há valor', () => {
    expect(formatEntityValue(null, 'characteristic')).toBe(NO_DATA_LABEL);
    expect(formatEntityValue(null, 'metric', 'PERCENT')).toBe(NO_DATA_LABEL);
  });

  it('usa duas casas para valores de 0 a 1', () => {
    expect(formatEntityValue(0.456, 'measure')).toBe('0.46');
    expect(formatEntityValue(0, 'subcharacteristic')).toBe('0.00');
  });

  it('mostra o valor bruto da métrica com a unidade', () => {
    expect(formatEntityValue(72.5, 'metric', 'PERCENT')).toBe('72.50 %');
    expect(formatEntityValue(120, 'metric', 'MILLISEC')).toBe('120 ms');
    expect(formatEntityValue(12, 'metric', 'INT')).toBe('12');
  });
});
