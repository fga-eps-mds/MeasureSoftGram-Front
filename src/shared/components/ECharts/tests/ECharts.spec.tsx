const mockLoaded = jest.fn();

jest.mock('../EChartsCore', () => {
  mockLoaded();
  return { __esModule: true, default: () => null };
});

describe('ECharts', () => {
  it('começa a baixar o ECharts quando a página importa o módulo, antes de algum gráfico montar', async () => {
    jest.isolateModules(() => {
      require('../ECharts');
    });

    await new Promise(process.nextTick);

    expect(mockLoaded).toHaveBeenCalledTimes(1);
  });
});
