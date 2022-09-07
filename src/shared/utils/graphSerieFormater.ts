export interface GraphSerieType {
  name: string;
  type: string;
  stack: string;
  data: number[] | undefined;
}

const graphSerieFormater = (
  config: { name: string; type?: string; stack?: string },
  data: number[] | undefined
): GraphSerieType => ({
  name: config.name,
  type: config.type ?? 'line',
  stack: config.stack ?? 'Total',
  data
});

export default graphSerieFormater;
