import {
  getQualityStatus,
  calculateVariation,
  formatPulseChartOptions,
  getBandTimePieces,
  COLOR_TOKENS,
  PulseRepositoryData,
} from '../formatPulseChart';
import { QUALITY_BANDS } from '../qualityBands';
import { PULSE_POINTS_PER_MEASUREMENT } from '../toPulseSeries';


describe('formatPulseChart Utility', () => {
  describe('getQualityStatus', () => {
    // faixas A a E do Indicador Total da Qualidade (US06.01), com os valores de limite
    it.each([
      [0, 'E', 'Muito ruim', '#BE2E0E'],
      [0.19, 'E', 'Muito ruim', '#BE2E0E'],
      [0.2, 'D', 'Ruim', '#F16141'],
      [0.39, 'D', 'Ruim', '#F16141'],
      [0.4, 'C', 'Bom', '#EBA133'],
      [0.59, 'C', 'Bom', '#EBA133'],
      [0.6, 'B', 'Muito bom', '#0DC889'],
      [0.79, 'B', 'Muito bom', '#0DC889'],
      [0.8, 'A', 'Ótimo', '#04724D'],
      [1, 'A', 'Ótimo', '#04724D'],
    ])('classifica %p na faixa %s (%s)', (value, grade, label, color) => {
      expect(getQualityStatus(value)).toEqual({ key: grade, label, color });
    });

    it('leva o que passar de 0 a 1 para a faixa da ponta', () => {
      expect(getQualityStatus(-0.1).key).toBe('E');
      expect(getQualityStatus(1.2).key).toBe('A');
    });
  });

  describe('formatPulseChartOptions', () => {
    it('pinta o pulso com as 5 faixas, trocando a cor no instante da medição que muda de faixa', () => {
      const at = (day: number) => `2026-01-0${day}T12:00:00Z`;
      const ms = (day: number) => new Date(at(day)).getTime();
      const repos: PulseRepositoryData[] = [
        {
          id: 1,
          name: 'repo',
          measurements: [0.1, 0.3, 0.5, 0.7, 0.9].map((value, i) => ({ created_at: at(i + 1), value })),
          releases: [],
        },
      ];
      const options: any = formatPulseChartOptions(repos);

      expect(options.visualMap).toEqual([
        {
          show: false,
          seriesIndex: 0,
          dimension: 0,
          pieces: [
            { lt: ms(2), color: '#BE2E0E' },
            { gte: ms(2), lt: ms(3), color: '#F16141' },
            { gte: ms(3), lt: ms(4), color: '#EBA133' },
            { gte: ms(4), lt: ms(5), color: '#0DC889' },
            { gte: ms(5), color: '#04724D' },
          ],
        },
      ]);
      // a cor da série teria prioridade sobre o visualMap
      expect(options.series[0].lineStyle.color).toBeUndefined();
    });

    it('agrupa as medições seguidas da mesma faixa num único trecho', () => {
      const at = (day: number) => `2026-01-0${day}T12:00:00Z`;
      expect(
        getBandTimePieces([
          { created_at: at(1), value: 0.85 },
          { created_at: at(2), value: 0.9 },
          { created_at: at(3), value: 0.5 },
          { created_at: at(4), value: 0.55 },
        ])
      ).toEqual([
        { lt: new Date(at(3)).getTime(), color: '#04724D' },
        { gte: new Date(at(3)).getTime(), color: '#EBA133' },
      ]);
      expect(getBandTimePieces([])).toEqual([]);
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

    it('sem troca de faixa, pinta o pulso inteiro na cor da faixa, sem visualMap', () => {
      // 0.45, 0.5 e 0.5: tudo na faixa C
      const options: any = formatPulseChartOptions([repoWithReleases]);

      expect(options.visualMap).toEqual([]);
      expect(options.series[0].lineStyle.color).toBe('#EBA133');
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

    it('deve formatar os eixos como dia/mês e indicador com uma casa decimal', () => {
      const options: any = formatPulseChartOptions([repoWithReleases]);

      expect(options.xAxis[0].axisLabel.formatter(new Date(2026, 0, 5).getTime())).toBe('05/01');
      expect(options.yAxis[0].axisLabel.formatter(0.5)).toBe('0.5');
    });

    it('pode tirar a etiqueta de início das releases e manter a linha pontilhada', () => {
      const options: any = formatPulseChartOptions([repoWithReleases], { releaseStartLabels: false });
      const [start, end] = options.series[0].markLine.data;

      expect(start.name).toBe('Início v1 Release 1');
      expect(start.label.show).toBe(false);
      expect(end.label.show).toBe(true);
    });

    describe('indicador TSQMI por release (US06.01)', () => {
      const tsqmi = (releaseId: number, value: number | null) => ({
        release_id: releaseId,
        value,
        created_at: null,
        previous_value: null,
        variation: null,
        variation_percent: null,
      });
      const release1 = {
        id: 10,
        name: 'Release 1',
        version: 'Release 1',
        end_at: '2026-01-04T00:00:00Z',
        tsqmi: tsqmi(10, 0.85),
      };
      const release2 = {
        id: 20,
        name: 'Release 2',
        version: 'Release 2',
        end_at: '2026-01-08T00:00:00Z',
        tsqmi: tsqmi(20, null),
      };
      const repoA: PulseRepositoryData = { ...repoWithReleases, id: 1, name: 'A', releases: [release1, release2] };
      const repoB: PulseRepositoryData = { ...repoWithReleases, id: 2, name: 'B', releases: [] };

      it('desenha um ponto no encerramento de cada release com indicador, na cor da faixa', () => {
        const options: any = formatPulseChartOptions([repoA]);
        const pointsSeries = options.series[1];

        expect(options.series).toHaveLength(2);
        expect(pointsSeries.type).toBe('scatter');
        expect(pointsSeries.xAxisIndex).toBe(0);
        // a Release 2 não teve análise na janela: sem ponto
        expect(pointsSeries.data).toEqual([
          {
            value: [new Date('2026-01-04T00:00:00Z').getTime(), 0.85],
            itemStyle: { color: '#04724D' },
            release: release1,
          },
        ]);
      });

      it('põe os pontos depois das séries do pulso, na faixa do repositório', () => {
        const options: any = formatPulseChartOptions([repoB, repoA]);

        expect(options.series.map((series: any) => series.type)).toEqual(['line', 'line', 'scatter']);
        expect(options.series[2].xAxisIndex).toBe(1);
        expect(options.series[2].yAxisIndex).toBe(1);
        // o visualMap das faixas continua só nas séries do pulso
        options.visualMap.forEach((visualMap: any) => expect(visualMap.seriesIndex).toBeLessThan(2));
      });

      it('não cria a série de pontos sem indicador nas releases', () => {
        const options: any = formatPulseChartOptions([repoWithReleases]);

        expect(options.series).toHaveLength(1);
      });

      it('com first-row, a etiqueta fica na primeira faixa que tem a release', () => {
        const onlyRelease2: PulseRepositoryData = { ...repoA, id: 3, name: 'C', releases: [release2] };
        const options: any = formatPulseChartOptions([repoB, onlyRelease2, repoA], { releaseLabels: 'first-row' });
        const endLabels = (series: any) =>
          series.markLine.data.filter((line: any) => !line.name.startsWith('Início')).map((line: any) => line.label.show);

        expect(endLabels(options.series[1])).toEqual([true]);
        // Release 1 ainda sem etiqueta, Release 2 já mostrada na faixa de C
        expect(endLabels(options.series[2])).toEqual([true, false]);
      });

      it('com releaseTooltip, mostra os detalhes da release sob o cursor', () => {
        const releaseTooltip = jest.fn(() => 'detalhes da release');
        const { formatter } = (formatPulseChartOptions([repoB, repoA], { releaseTooltip }) as any).tooltip;
        const releasePoint = { seriesName: 'A', seriesIndex: 2, dataIndex: 0, value: [0, 0.85], data: { release: release1, value: [0, 0.85] } };
        const measurement = { seriesName: 'B', seriesIndex: 0, dataIndex: 0, value: [0, 0.45] };

        expect(formatter([measurement, releasePoint])).toBe('detalhes da release');
        expect(releaseTooltip).toHaveBeenCalledWith([{ repository: 'A', release: release1, value: 0.85 }]);
        // longe das releases, continuam as medições
        expect(formatter([measurement])).toContain('<strong>B:</strong> 0,45');
      });

      it('o tooltip das medições ignora os pontos das releases', () => {
        const { formatter } = (formatPulseChartOptions([repoA]) as any).tooltip;
        const releasePoint = { seriesName: 'A', seriesIndex: 1, dataIndex: 0, value: [0, 0.85] };

        expect(formatter([releasePoint])).toBe('');
        expect(formatter([{ seriesName: 'A', seriesIndex: 0, dataIndex: 0, value: [0, 0.45] }, releasePoint])).toContain(
          '<strong>A:</strong> 0,45'
        );
      });
    });

    describe('tooltip', () => {
      const formatter = (formatPulseChartOptions([repoWithReleases]) as any).tooltip.formatter;
      // Ponto do pulso no pico do complexo da medição; o y do desenho é o pico ampliado, não o valor medido.
      const point = (measurement: number, seriesIndex = 0) => ({
        seriesName: 'CLI',
        seriesIndex,
        dataIndex: measurement * PULSE_POINTS_PER_MEASUREMENT + 2,
        value: [0, 0.99, 0],
      });

      it('deve ficar vazio sem pontos', () => {
        expect(formatter([])).toBe('');
        expect(formatter(undefined)).toBe('');
      });

      it('deve mostrar data, valor medido e variação em relação à medição anterior', () => {
        // medições em ordem: 01/01 = 0.45, 03/01 = 0.5, 05/01 = 0.5
        const html = formatter([point(1)]);

        expect(html).toContain('03/01/2026');
        expect(html).toContain('<strong>CLI:</strong> 0,50');
        expect(html).not.toContain('0,99');
        expect(html).toContain(`color: ${COLOR_TOKENS.adequate}">(+0,05)`);
      });

      it('deve mostrar variação negativa em vermelho', () => {
        const falling: PulseRepositoryData = {
          ...repoWithReleases,
          measurements: [
            { created_at: '2026-01-01T12:00:00Z', value: 0.45 },
            { created_at: '2026-01-03T12:00:00Z', value: 0.4 },
          ],
        };
        const fallingFormatter = (formatPulseChartOptions([falling]) as any).tooltip.formatter;

        expect(fallingFormatter([point(1)])).toContain(`color: ${COLOR_TOKENS.critical}">(−0,05)`);
      });

      it('deve calcular a variação com o repositório da série, mesmo com nomes repetidos', () => {
        const homonym: PulseRepositoryData = {
          ...repoWithReleases,
          id: 3,
          measurements: [
            { created_at: '2026-01-01T12:00:00Z', value: 0.2 },
            { created_at: '2026-01-03T12:00:00Z', value: 0.3 },
          ],
        };
        const twoSeriesFormatter = (formatPulseChartOptions([repoWithReleases, homonym]) as any).tooltip.formatter;

        // segunda série, segunda medição: 0.3 - 0.2 = +0.1 (pelo nome, pegaria o primeiro repositório: 0.5 - 0.45)
        const html = twoSeriesFormatter([point(1, 1)]);

        expect(html).toContain('<strong>CLI:</strong> 0,30');
        expect(html).toContain(`color: ${COLOR_TOKENS.adequate}">(+0,10)`);
      });

      it('não deve mostrar variação na primeira medição nem quando o valor não muda', () => {
        expect(formatter([point(0)])).not.toContain('<span style="color');
        expect(formatter([point(2)])).not.toContain('<span style="color');
      });

      it('qualquer ponto do complexo de uma medição mostra essa medição', () => {
        const atBase = { ...point(1), dataIndex: PULSE_POINTS_PER_MEASUREMENT };
        const atNewBase = { ...point(1), dataIndex: 2 * PULSE_POINTS_PER_MEASUREMENT - 1 };

        expect(formatter([atBase])).toContain('<strong>CLI:</strong> 0,50');
        expect(formatter([atNewBase])).toContain('<strong>CLI:</strong> 0,50');
      });

      it('não mostra variação que some nas duas casas decimais', () => {
        const tiny: PulseRepositoryData = {
          ...repoWithReleases,
          measurements: [
            { created_at: '2026-01-01T12:00:00Z', value: 0.5 },
            { created_at: '2026-01-03T12:00:00Z', value: 0.502 },
          ],
        };
        const tinyFormatter = (formatPulseChartOptions([tiny]) as any).tooltip.formatter;

        expect(tinyFormatter([point(1)])).not.toContain('<span style="color');
      });

      it('escapa o HTML do nome do repositório', () => {
        const html = formatter([{ ...point(1), seriesName: '<img src=x onerror=alert(1)>' }]);

        expect(html).not.toContain('<img');
        expect(html).toContain('&#60;img');
      });
    });

    describe('pulso de eletrocardiograma', () => {
      it('deixa o pico passar da faixa e usa o complexo de cada medição', () => {
        const options: any = formatPulseChartOptions([repoWithReleases]);

        expect(options.series[0].clip).toBe(false);
        expect(options.series[0].data).toHaveLength(3 * PULSE_POINTS_PER_MEASUREMENT);
      });

      it('usa o mesmo intervalo de tempo em todas as faixas, com folga à direita', () => {
        const early: PulseRepositoryData = {
          ...repoWithReleases,
          id: 9,
          measurements: [{ created_at: '2026-01-02T12:00:00Z', value: 0.5 }],
          releases: [],
        };
        const options: any = formatPulseChartOptions([early, repoWithReleases]);
        const min = new Date('2026-01-01T12:00:00Z').getTime();
        const max = new Date('2026-01-05T12:00:00Z').getTime();

        options.xAxis.forEach((axis: any) => {
          expect(axis.min).toBe(min);
          expect(axis.max).toBe(max + (max - min) * 0.05);
        });
      });

      it('o intervalo inclui o ponto de indicador das releases, mas não as releases sem indicador', () => {
        const withPoint: PulseRepositoryData = {
          ...repoWithReleases,
          releases: [
            { id: 1, name: 'R1', version: 'R1', end_at: '2026-01-10T12:00:00Z', tsqmi: { release_id: 1, value: 0.5, created_at: null, previous_value: null, variation: null, variation_percent: null } },
            { id: 2, name: 'R0', version: 'R0', start_at: '2025-06-01T00:00:00Z', end_at: '2025-07-01T00:00:00Z' },
          ],
        };
        const [axis] = (formatPulseChartOptions([withPoint]) as any).xAxis;

        expect(axis.min).toBe(new Date('2026-01-01T12:00:00Z').getTime());
        expect(axis.max).toBeGreaterThan(new Date('2026-01-10T12:00:00Z').getTime());
      });
    });
  });
});
