# MeasureSoftGram Frontend

[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=fga-eps-mds_2026.2-MeasureSoftGram-Front&metric=bugs)](https://sonarcloud.io/summary/new_code?id=fga-eps-mds_2026.2-MeasureSoftGram-Front)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=fga-eps-mds_2026.2-MeasureSoftGram-Front&metric=code_smells)](https://sonarcloud.io/summary/new_code?id=fga-eps-mds_2026.2-MeasureSoftGram-Front)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=fga-eps-mds_2026.2-MeasureSoftGram-Front&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=fga-eps-mds_2026.2-MeasureSoftGram-Front)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=fga-eps-mds_2026.2-MeasureSoftGram-Front&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=fga-eps-mds_2026.2-MeasureSoftGram-Front)
[![codecov](https://codecov.io/gh/fga-eps-mds/2026.2-MeasureSoftGram-Front/branch/develop/graph/badge.svg)](https://codecov.io/gh/fga-eps-mds/2026.2-MeasureSoftGram-Front)

Módulo responsável pelo Frontend da aplicação MeasureSoftGram.

## Sobre o repositório

O principal objetivo do `MeasureSoftGram-Front` é fornecer a interface web do MeasureSoftGram, permitindo que os usuários visualizem e interajam com os dados e resultados de qualidade de software processados pela plataforma. O projeto é desenvolvido majoritariamente em TypeScript, utilizando Next.js no frontend.

Suas responsabilidades incluem:

Visualização de Métricas: Apresentar de forma organizada indicadores e resultados relacionados à qualidade dos projetos analisados.
Interação com a Plataforma: Disponibilizar telas e componentes para navegação, configuração e consulta das informações do MeasureSoftGram.
Integração com os Serviços: Consumir os dados disponibilizados pelos demais componentes da arquitetura do MeasureSoftGram e apresentá-los ao usuário.

A documentação completa, instruções de instalação e o guia oficial deste projeto estão centralizados no nosso repositório de documentação.

## Documentação

- [Documentação do Frontend](https://fga-eps-mds.github.io/MeasureSoftGram-Docs/docs/componente-front/)
  - Arquitetura e funcionamento do componente
  - Configuração e execução
  - Informações técnicas específicas

- [Documentação oficial do MeasureSoftGram](https://fga-eps-mds.github.io/MeasureSoftGram-Docs/)
  - Visão geral do produto
  - Arquitetura geral
  - Documentação dos componentes

## Contribuição

Consulte o [Guia de Contribuição](https://fga-eps-mds.github.io/MeasureSoftGram-Docs/docs/como-contribuir/) antes de realizar alterações no projeto.

## Código de Conduta

Este projeto segue o [Código de Conduta](https://fga-eps-mds.github.io/MeasureSoftGram-Docs/docs/codigo-de-conduta/).
Módulo responsável pelo Frontend da aplicação MeasureSoftGram.

## Sobre o repositório

O principal objetivo do `MeasureSoftGram-Front` é fornecer a interface web do MeasureSoftGram, permitindo que os usuários visualizem e interajam com os dados e resultados de qualidade de software processados pela plataforma. O projeto é desenvolvido majoritariamente em TypeScript, utilizando Next.js no frontend.

Suas responsabilidades incluem:

Visualização de Métricas: Apresentar de forma organizada indicadores e resultados relacionados à qualidade dos projetos analisados.
Interação com a Plataforma: Disponibilizar telas e componentes para navegação, configuração e consulta das informações do MeasureSoftGram.
Integração com os Serviços: Consumir os dados disponibilizados pelos demais componentes da arquitetura do MeasureSoftGram e apresentá-los ao usuário.

A documentação completa, instruções de instalação e o guia oficial deste projeto estão centralizados no nosso repositório de documentação.

## Documentação

- [Documentação do Frontend](https://fga-eps-mds.github.io/MeasureSoftGram-Docs/docs/componente-front/)
  - Arquitetura e funcionamento do componente
  - Configuração e execução
  - Informações técnicas específicas

- [Documentação oficial do MeasureSoftGram](https://fga-eps-mds.github.io/MeasureSoftGram-Docs/)
  - Visão geral do produto
  - Arquitetura geral
  - Documentação dos componentes

## Contribuição

Consulte o [Guia de Contribuição](https://fga-eps-mds.github.io/MeasureSoftGram-Docs/docs/como-contribuir/) antes de realizar alterações no projeto.

## Código de Conduta

Este projeto segue o [Código de Conduta](https://fga-eps-mds.github.io/MeasureSoftGram-Docs/docs/codigo-de-conduta/).

## Exportação de CSV dos dashboards

Cada gráfico de um dashboard declara o que exporta como um `CsvChart` (`src/shared/utils/exportCsv.ts`): o `name` que vai no nome do arquivo, as colunas (a chave do campo na linha e o título do cabeçalho) e as linhas, montadas com os dados que a tela já carregou, com os filtros aplicados e os valores sem arredondar.

```ts
import { CsvChart, CsvColumn } from '@utils/exportCsv';

type PairRow = { row: string; column: string; coefficient: number | null };

const columns: CsvColumn<PairRow>[] = [
  { key: 'row', title: 'Linha' },
  { key: 'column', title: 'Coluna' },
  { key: 'coefficient', title: 'Coeficiente' }
];

const chart: CsvChart<PairRow> = { name: 'matriz-correlacao', columns, rows };
```

- O botão "Exportar .csv" de cada gráfico vai no `headerAction` do `DashboardCard`: `<ExportCsvButton dashboard="relacoes" chart={chart} />`. Ele baixa `msgram-<dashboard>-<grafico>-<data>.csv` e fica desabilitado sem linhas.
- O botão do topo da página recebe os gráficos dela: `<ExportAllCsvButton dashboard="relacoes" charts={[...]} />`. Ele baixa `msgram-<dashboard>-<data>.zip`, com um CSV por gráfico com dados.
- O CSV é separado por vírgula e escapa vírgula, aspas e quebra de linha (RFC 4180). Um valor `null` fica vazio.

O exemplo completo é o dashboard "6. Relações e Correlações" (`formatCorrelationCsv`, em `src/shared/utils/formatCorrelationCharts.ts`).

O dashboard "4. Análise por Entidade" exporta o mapa de calor, a contribuição e o ranking dos piores pares (`formatEntityHeatmapCsv`, `formatEntityContributionCsv` e `formatEntityRankingCsv`, em `src/shared/utils/entityMatrix.ts`), sempre com a release e o nível escolhidos. A célula "sem dado" e a variação da primeira release ficam vazias.

O dashboard "5. Distribuição Estatística" exporta o histograma, a curva de densidade, o boxplot, a dispersão no tempo e o resumo estatístico (`formatDistributionCsvs`, em `src/shared/utils/formatDistributionCsv.ts`), sempre com a release, o repositório, o nível e a entidade escolhidos no começo de cada linha. Com menos de 3 análises, o CSV da densidade fica sem linhas e o botão dele aparece desabilitado no quadro vazio (`emptyHeaderAction` do `DashboardCard`).

O dashboard "1. Visão Geral de Qualidade" exporta os totais, o Indicador Total da Qualidade, o planejado × realizado e o radar (`formatTotalsCsv`, `formatIndicatorCsv`, `formatPlannedAccomplishedCsv` e `formatRadarCsv`, em `src/shared/utils/formatOverviewCsv.ts`), sempre com a release escolhida no começo de cada linha. O planejado × realizado e o radar levam só o repositório escolhido no seletor do card, e o realizado de uma característica sem análise fica vazio. Os totais entram só no `.zip`, e o radar tem o próprio botão ("Exportar .csv do radar") no mesmo card do planejado × realizado: quando um card tem mais de um gráfico, `ExportCsvButton` recebe `ariaLabel` para diferenciá-los.

O dashboard "2. Evolução Temporal" exporta um CSV por gráfico (`formatTemporalCsv`, em `src/shared/utils/formatTemporalCsv.ts`), só com as entidades filtradas na tela e a data no eixo escolhido (`yyyy-MM-dd` em dias, `yyyy-MM` em meses). O botão do gráfico sem dados aparece desabilitado (`emptyHeaderAction`), e o `.zip` leva só os gráficos com dados.

Os gráficos de pulso (`formatProductPulseCsv` e `formatRepositoryPulseCsv`, em `src/shared/utils/formatPulseCsv.ts`) exportam as medições do período filtrado, em ordem de data, com o grau (A a E) da faixa do valor. O pulso do produto usa o botão dentro de `PulseChartFilters` (`exportAction`); o da tela do repositório fica no card e, junto com o `.zip` do topo, usa o mesmo `useRepositoryPulse`, que a página busca e passa ao card.

## Licença

Este projeto é distribuído sob a licença [GNU AGPL-3.0](./LICENSE).
