import {
  getQualityStatus,
  calculateVariation,
  formatPulseChartOptions,
  convertPulseRepositoriesToCsv,
  COLOR_TOKENS,
  PulseRepositoryData,
} from '../formatPulseChart';
import { QUALITY_BANDS } from '../qualityBands';


describe('formatPulseChart Utility', () => {
  describe('getQualityStatus', () => {
    // faixas A a E do Indicador Total da Qualidade (US06.01), com os valores de limite
    it.each([
      [0, 'E', 'Muito ruim', '#D7191C'],
      [0.19, 'E', 'Muito ruim', '#D7191C'],
      [0.2, 'D', 'Ruim', '#FE7D37'],
      [0.39, 'D', 'Ruim', '#FE7D37'],
      [0.4, 'C', 'Bom', '#DFB317'],
      [0.59, 'C', 'Bom', '#DFB317'],
      [0.6, 'B', 'Muito bom', '#8CC63F'],
      [0.79, 'B', 'Muito bom', '#8CC63F'],
      [0.8, 'A', 'Ótimo', '#1A9641'],
      [1, 'A', 'Ótimo', '#1A9641'],
    ])('classifica %p na faixa %s (%s)', (value, grade, label, color) => {
      expect(getQualityStatus(value)).toEqual({ key: grade, label, color });
    });

    it('leva o que passar de 0 a 1 para a faixa da ponta', () => {
      expect(getQualityStatus(-0.1).key).toBe('E');
      expect(getQualityStatus(1.2).key).toBe('A');
    });
  });

  describe('formatPulseChartOptions', () => {
    it('pinta o pulso com as 5 faixas', () => {
      const repos: PulseRepositoryData[] = [
        { id: 1, name: 'repo', measurements: [{ created_at: '2026-01-01T12:00:00Z', value: 0.5 }], releases: [] },
      ];
      const options = formatPulseChartOptions(repos) as { visualMap: { pieces: { color: string }[] }[] };

      expect(options.visualMap[0].pieces.map((piece) => piece.color)).toEqual([
        '#D7191C',
        '#FE7D37',
        '#DFB317',
        '#8CC63F',
        '#1A9641',
      ]);
    });
  });

  describe('calculateVariation', () => {
    it('deve retornar null se o valor anterior não for informado', () => {
      expect(calculateVariation(0.8, undefined)).toBeNull();
    });

    it('deve calcular variação positiva corretamente', () => {
      const res = calculateVariation(0.8, 0.75);
      expect(res).not.toBeNull();
      expect(res?.isPositive).toBe(true);
      expect(res?.formattedDiff).toBe('+0.0500');
      expect(res?.formattedPercentage).toContain('▲');
      expect(res?.color).toBe(COLOR_TOKENS.adequate);
    });

    it('deve calcular variação negativa corretamente', () => {
      const res = calculateVariation(0.4, 0.5);
      expect(res).not.toBeNull();
      expect(res?.isNegative).toBe(true);
      expect(res?.formattedDiff).toBe('-0.1000');
      expect(res?.formattedPercentage).toContain('▼');
      expect(res?.color).toBe(COLOR_TOKENS.critical);
    });
  });

  describe('formatPulseChartOptions', () => {
    it('deve retornar objeto vazio para lista de repositórios vazia', () => {
      expect(formatPulseChartOptions([])).toEqual({});
    });

    it('deve gerar opções do ECharts com a quantidade correta de grids e séries', () => {
      const repos: PulseRepositoryData[] = [
        {
          id: 1,
          name: '2022-1-MeasureSoftGram-Front',
          measurements: [
            { created_at: '2026-01-01T12:00:00Z', value: 0.8 },
            { created_at: '2026-01-02T12:00:00Z', value: 0.85 },
          ],
          releases: [
            { name: 'Release 1', version: 'v2025.1.0', end_at: '2026-01-02T12:00:00Z' },
          ],
        },
      ];

      const options: any = formatPulseChartOptions(repos);

      expect(options.grid).toHaveLength(1);
      expect(options.xAxis).toHaveLength(1);
      expect(options.yAxis).toHaveLength(1);
      expect(options.series).toHaveLength(1);
      expect(options.series[0].name).toBe('2022-1-MeasureSoftGram-Front');
      expect(options.dataZoom).toBeDefined();
    });

    const repoWithReleases: PulseRepositoryData = {
      id: 2,
      name: 'CLI',
      measurements: [
        { created_at: '2026-01-03T12:00:00Z', value: 0.5 },
        { created_at: '2026-01-01T12:00:00Z', value: 0.45 },
        { created_at: '2026-01-05T12:00:00Z', value: 0.5 },
      ],
      releases: [
        { name: 'Release 1', version: 'v1', start_at: '2026-01-01T00:00:00Z', end_at: '2026-01-04T00:00:00Z' },
        { name: '', version: 'v2', start_at: 'data inválida', end_at: 'data inválida' },
      ],
    };

    it('deve marcar início e fim das releases com datas válidas', () => {
      const options: any = formatPulseChartOptions([repoWithReleases]);
      const markLines = options.series[0].markLine.data;

      expect(markLines.map((line: any) => line.name)).toEqual(['Início v1 Release 1', 'v1 Release 1']);
      expect(markLines[0].xAxis).toBe(new Date('2026-01-01T00:00:00Z').getTime());
    });

    it('deve pintar o pulso com as mesmas faixas de getQualityStatus', () => {
      const options: any = formatPulseChartOptions([repoWithReleases]);

      expect(options.visualMap[0].pieces).toEqual([
        { lt: 0.2, color: '#D7191C' },
        { gte: 0.2, lt: 0.4, color: '#FE7D37' },
        { gte: 0.4, lt: 0.6, color: '#DFB317' },
        { gte: 0.6, lt: 0.8, color: '#8CC63F' },
        { gte: 0.8, color: '#1A9641' },
      ]);
      QUALITY_BANDS.forEach((band) => expect(getQualityStatus(band.min).color).toBe(band.color));
    });

    it('mantém por padrão as etiquetas das releases em todas as faixas e as linhas horizontais', () => {
      const options: any = formatPulseChartOptions([repoWithReleases, { ...repoWithReleases, id: 3 }]);

      options.series.forEach((series: any) =>
        series.markLine.data.forEach((line: any) => expect(line.label.show).toBe(true))
      );
      expect(options.yAxis[0].splitLine.show).toBe(true);
    });

    it('pode mostrar as etiquetas só na primeira faixa e tirar as linhas horizontais', () => {
      const options: any = formatPulseChartOptions([repoWithReleases, { ...repoWithReleases, id: 3 }], {
        releaseLabels: 'first-row',
        horizontalLines: false,
      });

      const labelsShown = options.series.map((series: any) => series.markLine.data.map((line: any) => line.label.show));
      expect(labelsShown).toEqual([
        [true, true],
        [false, false],
      ]);
      // os marcadores continuam em todas as faixas
      expect(options.series[1].markLine.data).toHaveLength(2);
      options.yAxis.forEach((axis: any) => expect(axis.splitLine.show).toBe(false));
    });

    it('deve formatar os eixos como mês/dia e nota com uma casa decimal', () => {
      const options: any = formatPulseChartOptions([repoWithReleases]);

      expect(options.xAxis[0].axisLabel.formatter(new Date(2026, 0, 5).getTime())).toBe('01/05');
      expect(options.yAxis[0].axisLabel.formatter(0.5)).toBe('0.5');
    });

    describe('tooltip', () => {
      const formatter = (formatPulseChartOptions([repoWithReleases]) as any).tooltip.formatter;
      const point = (dataIndex: number, value: number) => ({
        seriesName: 'CLI',
        dataIndex,
        value: [new Date('2026-01-03T12:00:00Z').getTime(), value],
      });

      it('deve ficar vazio sem pontos', () => {
        expect(formatter([])).toBe('');
        expect(formatter(undefined)).toBe('');
      });

      it('deve mostrar data, valor e variação em relação à medição anterior', () => {
        const html = formatter([point(3, 0.5)]);

        expect(html).toContain('2026-01-03');
        expect(html).toContain('<strong>CLI:</strong> 0.5000');
        expect(html).toContain(`color: ${COLOR_TOKENS.adequate}">(+0.0500)`);
      });

      it('deve mostrar variação negativa em vermelho', () => {
        expect(formatter([point(3, 0.4)])).toContain(`color: ${COLOR_TOKENS.critical}">(-0.0500)`);
      });

      it('não deve mostrar variação na primeira medição nem quando o valor não muda', () => {
        expect(formatter([point(0, 0.45)])).not.toContain('<span style="color');
        expect(formatter([point(6, 0.5)])).not.toContain('<span style="color');
      });
    });
  });

  describe('convertPulseRepositoriesToCsv', () => {
    it('deve gerar string CSV válida contendo os cabeçalhos e valores de medições', () => {
      const repos: PulseRepositoryData[] = [
        {
          id: 1,
          name: '2022-1-MeasureSoftGram-Front',
          measurements: [
            { created_at: '2026-01-01T12:00:00Z', value: 0.8 },
          ],
          releases: [],
        },
      ];

      const csv = convertPulseRepositoriesToCsv(repos);
      expect(csv).toContain('id,key,name,description,historyId,history_characteristic_id,history_value,history_created_at,quality_status');
      expect(csv).toContain('1,,"2022-1-MeasureSoftGram-Front",,1,,0.8,2026-01-01T12:00:00Z,Ótimo');
    });
  });
});

