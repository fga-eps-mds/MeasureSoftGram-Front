import formatRepositoriesTsqmiHistory from '../formatRepositoriesTsqmiHistory';
import convertToCsv from '../convertToCsv';

jest.mock('../convertToCsv', () => jest.fn(() => 'csv,mock,content'));

describe('formatRepositoriesTsqmiHistory', () => {
  let mockCreateObjectURL: jest.Mock;
  let mockRevokeObjectURL: jest.Mock;
  let mockCreateElement: jest.SpyInstance;
  let mockAnchorClick: jest.Mock;

  beforeAll(() => {
    mockCreateObjectURL = jest.fn().mockReturnValue('blob:http://localhost/mocked-url');
    mockRevokeObjectURL = jest.fn();
    window.URL.createObjectURL = mockCreateObjectURL;
    window.URL.revokeObjectURL = mockRevokeObjectURL;

    mockAnchorClick = jest.fn();
    mockCreateElement = jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        return {
          href: '',
          download: '',
          click: mockAnchorClick
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

  const mockHistory: any = {
    results: [
      {
        name: 'Repositório Backend',
        history: [
          { created_at: '2026-05-20T10:00:00.000Z', value: 0.123 },
          { created_at: '2026-05-21T10:00:00.000Z', value: 0.567 }
        ]
      },
      {
        name: 'Repositório Frontend',
        history: [{ created_at: '2026-05-20T10:00:00.000Z', value: 0.999 }]
      }
    ]
  };

  const mockCsvFilters: any = {
    dateRange: { startDate: 0, endDate: 0 }
  };

  const mockGetOption = jest.fn();
  const mockRef: any = {
    current: {
      getEchartsInstance: () => ({
        getOption: mockGetOption
      })
    }
  };

  describe('Formatação de Options e Series', () => {
    it('deve formatar as séries corretamente, incluindo arredondamento matemático e conversão de data', () => {
      const result = formatRepositoriesTsqmiHistory({
        history: mockHistory,
        csvFilters: mockCsvFilters,
        ref: mockRef
      });

      expect(result.options.title.text).toBe('Comportamento observado do produto');
      expect(result.options.series).toHaveLength(2);

      expect(result.options.series[0].name).toBe('Repositório Backend');
      expect(result.options.series[0].data[0][0]).toBe(new Date('2026-05-20T10:00:00.000Z').getTime());
      expect(result.options.series[0].data[0][1]).toBe(0.12);
      expect(result.options.series[0].data[1][1]).toBe(0.57);

      expect(result.options.series[1].name).toBe('Repositório Frontend');
      expect(result.options.series[1].data[0][1]).toBe(1);
    });

    it('deve formatar corretamente a legenda duplicando os itens', () => {
      const result = formatRepositoriesTsqmiHistory({
        history: mockHistory,
        csvFilters: mockCsvFilters,
        ref: mockRef
      });

      expect(result.options.legend.data).toEqual([
        'Repositório Backend',
        'Repositório Backend',
        'Repositório Frontend',
        'Repositório Frontend'
      ]);
    });

    it('não deve quebrar se history.results for undefined', () => {
      const result = formatRepositoriesTsqmiHistory({
        history: {} as any,
        csvFilters: mockCsvFilters,
        ref: mockRef
      });

      expect(result.options.series).toEqual([]);
      expect(result.options.legend.data).toEqual([]);
    });
  });

  describe('Eventos (onEvents.datazoom)', () => {
    it('deve atualizar o csvFilters com startValue e endValue vindos do gráfico', () => {
      mockGetOption.mockReturnValue({
        dataZoom: [{ startValue: 1620000000, endValue: 1621000000 }]
      });

      const result = formatRepositoriesTsqmiHistory({
        history: mockHistory,
        csvFilters: mockCsvFilters,
        ref: mockRef
      });

      result.onEvents.datazoom();

      expect(mockCsvFilters.dateRange.startDate).toBe(1620000000);
      expect(mockCsvFilters.dateRange.endDate).toBe(1621000000);
    });

    it('não deve atualizar os filtros se startValue ou endValue não existirem', () => {
      mockGetOption.mockReturnValue({
        dataZoom: [{}]
      });

      mockCsvFilters.dateRange = { startDate: 0, endDate: 0 };

      const result = formatRepositoriesTsqmiHistory({
        history: mockHistory,
        csvFilters: mockCsvFilters,
        ref: mockRef
      });

      result.onEvents.datazoom();

      expect(mockCsvFilters.dateRange.startDate).toBe(0);
      expect(mockCsvFilters.dateRange.endDate).toBe(0);
    });

    it('não deve quebrar se a ref (ref.current) for nula', () => {
      const result = formatRepositoriesTsqmiHistory({
        history: mockHistory,
        csvFilters: mockCsvFilters,
        ref: { current: null }
      });

      expect(() => result.onEvents.datazoom()).not.toThrow();
    });

    it('não deve quebrar se csvFilters.dateRange for undefined', () => {
      const result = formatRepositoriesTsqmiHistory({
        history: mockHistory,
        csvFilters: {} as any,
        ref: mockRef
      });

      expect(() => result.onEvents.datazoom()).not.toThrow();
    });
  });

  describe('Exportação de CSV (Toolbox customTool)', () => {
    it('deve gerar e baixar o CSV ao clicar no ícone de exportação', () => {
      const result = formatRepositoriesTsqmiHistory({
        history: mockHistory,
        csvFilters: mockCsvFilters,
        ref: mockRef
      });

      result.options.toolbox.feature.myCustomTool.onclick();

      expect(convertToCsv).toHaveBeenCalledWith(mockHistory.results, mockCsvFilters);
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockAnchorClick).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/mocked-url');
    });

    it('não deve executar o fluxo de CSV se history.results for falsy', () => {
      const result = formatRepositoriesTsqmiHistory({
        history: { results: undefined } as any,
        csvFilters: mockCsvFilters,
        ref: mockRef
      });

      result.options.toolbox.feature.myCustomTool.onclick();

      expect(convertToCsv).not.toHaveBeenCalled();
    });
  });
});
