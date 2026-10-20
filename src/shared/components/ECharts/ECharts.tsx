import dynamic from 'next/dynamic';

// O ECharts é o maior pedaço de JS das telas com gráfico. Pedido só quando o gráfico monta, ele esperava os dados
// chegarem; importado junto com a página, ele baixa enquanto os dados ainda estão a caminho (o webpack serve o
// mesmo chunk para os dois imports).
if (typeof window !== 'undefined') {
  import('./EChartsCore').catch(() => {
    // sem rede agora, o dynamic tenta de novo quando o gráfico montar
  });
}

// o import precisa ficar escrito aqui dentro: é por ele que o Next sabe quando o chunk já chegou e desenha direto
const ReactEcharts = dynamic(() => import('./EChartsCore'), { ssr: false });

export default ReactEcharts;
