import { Historical } from '@customTypes/repository';
import formatGaugeChart, { FormatGaugeChartType } from '@utils/formatGaugeChart';
import convertToCsv from '../convertToCsv'; // Verifique se o caminho relativo está correto no seu projeto

// Mockamos a função de CSV para não precisarmos do arquivo real
jest.mock('../convertToCsv', () => jest.fn(() => 'mock,csv,data'));

describe('formatGaugeChart', () => {
  const chartTitle: string = 'title-test';
  
  let mockCreateObjectURL: jest.Mock;
  let mockRevokeObjectURL: jest.Mock;
  let mockCreateElement: jest.SpyInstance;
  let mockAnchorClick: jest.Mock;

  beforeAll(() => {
    // Mocks globais para simular o download do navegador
    mockCreateObjectURL = jest.fn().mockReturnValue('blob:http://localhost/mock-url');
    mockRevokeObjectURL = jest.fn();
    window.URL.createObjectURL = mockCreateObjectURL;
    window.URL.revokeObjectURL = mockRevokeObjectURL;

    mockAnchorClick = jest.fn();
    mockCreateElement = jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: mockAnchorClick,
        } as unknown as HTMLElement;
      }
      return document.createElement.getMockImplementation()!(tagName);
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const historic: Historical = {
    id: 1,
    key: 'reliability',
    name: 'Reliability',
    history: [],
    latest: {
      id: 12,
      value: 32,
      // Usamos uma data fixa para que os Snapshots não quebrem a cada nova execução
      created_at: new Date('2026-05-20T10:00:00Z'), 
    },
    goal: 80, 
  };

  it('deve retornar um objeto com o formato correto e limites padrão', () => {
    const historical: Historical[] = [historic, historic, historic];
    const params: FormatGaugeChartType = {
      historical,
      title: chartTitle,
      isEmpty: false
    };

    const values = formatGaugeChart(params);
    expect(values).toMatchSnapshot();
    
    // Verifica limites padrão (redLimit = 0.33 e yellowLimit = 0.66)
    expect(values.series[0].axisLine.lineStyle.color[0][0]).toBe(0.33);
    expect(values.series[0].axisLine.lineStyle.color[1][0]).toBe(0.66);
  });

  it('deve formatar o gráfico quando o array de historical for par', () => {
    const historical: Historical[] = [historic, historic];
    const params: FormatGaugeChartType = { historical, title: chartTitle, isEmpty: false };

    const values = formatGaugeChart(params);
    expect(values).toMatchSnapshot();
    
    // Verifica se incrementX = 50 foi aplicado (25 + 0 * 50 = 25%)
    expect(values.series[0].center[0]).toBe('25%'); 
  });

  it('deve considerar limites (red e yellow) personalizados', () => {
    const params: FormatGaugeChartType = {
      historical: [historic],
      title: chartTitle,
      isEmpty: false,
      redLimit: 0.5,
      yellowLimit: 0.8
    };

    const values = formatGaugeChart(params);
    expect(values.series[0].axisLine.lineStyle.color[0][0]).toBe(0.5);
    expect(values.series[0].axisLine.lineStyle.color[1][0]).toBe(0.8);
  });

  it('deve tratar a falta do atributo goal usando 100 como padrão (?? 100)', () => {
    const historicNoGoal: Historical = { ...historic, goal: undefined };
    const params: FormatGaugeChartType = { historical: [historicNoGoal], title: chartTitle, isEmpty: false };

    const values = formatGaugeChart(params);
    // 100 / 100 = 1, toFixed(2) vira "1.00"
    expect(values.series[0].data[1].value).toBe('1.00');
  });

  it('deve retornar a formatação correta do axisLabel com base no valor (0.5 vs outros)', () => {
    const params: FormatGaugeChartType = { historical: [historic], title: chartTitle, isEmpty: false };
    const values = formatGaugeChart(params);
    
    // Extrai a função formatter criada dentro do seu map
    const formatterFn = values.series[0].axisLabel.formatter;

    expect(formatterFn(0.5)).toBe('Reliability'); // Se for 0.5, retorna o nome do item
    expect(formatterFn(0.2)).toBe(''); // Qualquer outro valor retorna string vazia
  });

  describe('Export CSV toolbox', () => {
    it('deve gerar o CSV e baixar o arquivo quando houver histórico', () => {
      const params: FormatGaugeChartType = { historical: [historic], title: chartTitle, isEmpty: false };
      const values = formatGaugeChart(params);
      
      // Simula o clique manual na ferramenta de exportar
      values.toolbox.feature.myCustomTool.onclick();

      expect(convertToCsv).toHaveBeenCalledWith([historic], {});
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockAnchorClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it('não deve quebrar e nem chamar CSV se historical for nulo/undefined', () => {
      const params: FormatGaugeChartType = { historical: undefined, title: chartTitle, isEmpty: false };
      const values = formatGaugeChart(params);
      
      // Simula o clique quando os dados ainda não chegaram
      values.toolbox.feature.myCustomTool.onclick();

      expect(convertToCsv).not.toHaveBeenCalled();
    });
  });
});
