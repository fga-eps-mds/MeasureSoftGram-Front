import { renderHook } from '@testing-library/react';
import { usePreloadECharts } from '../ECharts';

const mockLoaded = jest.fn();

jest.mock('../EChartsCore', () => {
  mockLoaded();
  return { __esModule: true, default: () => null };
});

describe('ECharts', () => {
  it('não baixa o ECharts só por a página importar o módulo', async () => {
    await new Promise(process.nextTick);

    expect(mockLoaded).not.toHaveBeenCalled();
  });

  it('começa a baixar o ECharts quando a página com gráficos monta, antes de algum gráfico aparecer', async () => {
    renderHook(() => usePreloadECharts());
    await new Promise(process.nextTick);

    expect(mockLoaded).toHaveBeenCalledTimes(1);
  });
});
