import { useEffect } from 'react';
import dynamic from 'next/dynamic';

/**
 * Começa a baixar o ECharts quando a página com gráficos monta, junto com as chamadas à API, e não só quando o
 * gráfico aparece (depois dos dados). Fica num hook, e não no carregamento do módulo, porque o Next 12 executa os
 * módulos das abas do menu no tempo ocioso depois do prefetch: no módulo, o ECharts era baixado em toda página.
 */
export function usePreloadECharts() {
  useEffect(() => {
    import('./EChartsCore').catch(() => {
      // sem rede agora, o dynamic tenta de novo quando o gráfico montar
    });
  }, []);
}

// o import precisa ficar escrito aqui dentro: é por ele que o Next sabe quando o chunk já chegou e desenha direto
const ReactEcharts = dynamic(() => import('./EChartsCore'), { ssr: false });

export default ReactEcharts;
