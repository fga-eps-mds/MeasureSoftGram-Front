import { QualityModelNode } from '@customTypes/metamodel';
import { toCsv } from '../exportCsv';
import { METAMODEL_CSV, formatMetamodelCsv } from '../formatMetamodelCsv';

const TREE: QualityModelNode = {
  id: null,
  type: 'tsqmi',
  key: 'tsqmi',
  name: 'TSQMI',
  description: 'Nota final',
  weight: 100,
  children: [
    {
      id: 1,
      type: 'characteristic',
      key: 'maintainability',
      name: 'Maintainability',
      description: 'Capacidade de manutenção',
      weight: 33.333333333333336,
      children: [
        {
          id: 11,
          type: 'subcharacteristic',
          key: 'modifiability',
          name: 'Modifiability',
          description: 'Facilidade de modificação',
          weight: 60,
          children: [
            {
              id: 111,
              type: 'measure',
              key: 'density_non_complex',
              name: 'Densidade de arquivos não complexos',
              description: null,
              weight: 34.5,
              min_threshold: 0,
              max_threshold: 10,
              children: [
                {
                  id: 1001,
                  type: 'metric',
                  key: 'ncloc',
                  name: 'ncloc',
                  description: 'Linhas de código',
                  weight: null,
                  children: []
                },
                {
                  id: 1002,
                  type: 'metric',
                  key: 'complexity',
                  name: '',
                  description: 'Complexidade ciclomática',
                  weight: null,
                  children: []
                }
              ]
            },
            {
              id: 112,
              type: 'measure',
              key: 'density_commented',
              name: 'Densidade de arquivos comentados',
              description: null,
              weight: 65.5,
              min_threshold: 10,
              max_threshold: null,
              children: [
                {
                  id: 1001,
                  type: 'metric',
                  key: 'ncloc',
                  name: 'ncloc',
                  description: 'Linhas de código',
                  weight: null,
                  children: []
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

const lines = (chart: Parameters<typeof toCsv>[0]) => toCsv(chart).split('\r\n');

describe('formatMetamodelCsv', () => {
  it('exporta uma linha por nó da árvore, com os pesos sem arredondar e a métrica compartilhada em cada medida', () => {
    const chart = formatMetamodelCsv('2026.2 R2', TREE);

    expect(chart.name).toBe(METAMODEL_CSV.tree);
    expect(lines(chart)).toEqual([
      'Release,Nível,Chave,Nome,Entidade pai,Peso (%),Mínimo,Máximo',
      '2026.2 R2,TSQMI,tsqmi,TSQMI,,,,',
      '2026.2 R2,Característica,maintainability,Maintainability,TSQMI,33.333333333333336,,',
      '2026.2 R2,Subcaracterística,modifiability,Modifiability,Maintainability,60,,',
      '2026.2 R2,Medida,density_non_complex,Densidade de arquivos não complexos,Modifiability,34.5,0,10',
      '2026.2 R2,Métrica,ncloc,ncloc,Densidade de arquivos não complexos,,,',
      '2026.2 R2,Métrica,complexity,complexity,Densidade de arquivos não complexos,,,',
      '2026.2 R2,Medida,density_commented,Densidade de arquivos comentados,Modifiability,65.5,10,',
      '2026.2 R2,Métrica,ncloc,ncloc,Densidade de arquivos comentados,,,'
    ]);
  });

  it('deixa Mínimo e Máximo vazios fora das medidas, mesmo se vierem preenchidos no nó', () => {
    const treeWithThresholdsOnChar: QualityModelNode = {
      ...TREE,
      min_threshold: 0,
      max_threshold: 100,
      children: [
        {
          id: 1,
          type: 'characteristic',
          key: 'reliability',
          name: 'Reliability',
          description: null,
          weight: 50,
          min_threshold: 1,
          max_threshold: 2,
          children: []
        }
      ]
    };

    const chart = formatMetamodelCsv('R1', treeWithThresholdsOnChar);

    expect(chart.rows).toEqual([
      { release: 'R1', level: 'TSQMI', key: 'tsqmi', name: 'TSQMI', parent: null, weight: null, min: null, max: null },
      {
        release: 'R1',
        level: 'Característica',
        key: 'reliability',
        name: 'Reliability',
        parent: 'TSQMI',
        weight: 50,
        min: null,
        max: null
      }
    ]);
  });

  it('retorna lista vazia quando não há árvore carregada', () => {
    expect(formatMetamodelCsv('R1', null).rows).toEqual([]);
    expect(formatMetamodelCsv('R1', undefined).rows).toEqual([]);
  });
});

