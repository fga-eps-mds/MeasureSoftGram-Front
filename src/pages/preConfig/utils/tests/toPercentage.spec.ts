import '@testing-library/jest-dom';
import toPercentage from '../toPercentage';

test('Transforma para porcentagem', () => {
  const value = 1000;
  const result = toPercentage(value);
  expect(result).toBe(100);

  const value2 = 50;
  const result2 = toPercentage(value2);
  expect(result2).toBe(50);
});
