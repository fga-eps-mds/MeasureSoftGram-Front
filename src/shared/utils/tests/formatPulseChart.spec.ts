import {
  getQualityStatus,
  calculateVariation,
  formatPulseChartOptions,
  convertPulseRepositoriesToCsv,
  COLOR_TOKENS,
  PulseRepositoryData,
} from '../formatPulseChart';


describe('formatPulseChart Utility', () => {
  describe('getQualityStatus', () => {
    it('deve classificar valores menores que 0.40 como crítico', () => {
      const status = getQualityStatus(0.35);
      expect(status.key).toBe('critical');
      expect(status.label).toBe('crítico');
      expect(status.color).toBe(COLOR_TOKENS.critical);
    });

    it('deve classificar valores entre 0.40 e 0.69 como atenção', () => {
      const status = getQualityStatus(0.55);
      expect(status.key).toBe('warning');
      expect(status.label).toBe('atenção');
      expect(status.color).toBe(COLOR_TOKENS.warning);
    });

    it('deve classificar valores maiores ou iguais a 0.70 como adequado', () => {
      const status = getQualityStatus(0.75);
      expect(status.key).toBe('adequate');
      expect(status.label).toBe('adequado');
      expect(status.color).toBe(COLOR_TOKENS.adequate);
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
      expect(csv).toContain('1,,"2022-1-MeasureSoftGram-Front",,1,,0.8,2026-01-01T12:00:00Z,adequado');
    });
  });
});

