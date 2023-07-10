import React from 'react';

import { NextPageWithLayout } from '@pages/_app.next';

import { Box, Container } from '@mui/material';
import SsidChartIcon from '@mui/icons-material/SsidChart';
import LineAxisIcon from '@mui/icons-material/LineAxis';
import SpeedIcon from '@mui/icons-material/Speed';

import { AiOutlineRadarChart } from 'react-icons/ai';

import useRequireAuth from '@hooks/useRequireAuth';

import GraphicChart from '@components/GraphicChart';
import LatestValueTable from '@components/LatestValueTable';

import Layout from '@components/Layout/Layout';
import ProductConfigFilterProvider from '@contexts/ProductConfigFilterProvider/ProductConfigFilterProvider';
import TreeViewFilter from './components/TreeViewFilter';
import Headers from './components/Header';
import CustomTabs from './components/CustomTabs';

import { useQuery } from './hooks/useQuery';

const Repository: NextPageWithLayout = () => {
  useRequireAuth();
  useQuery();

  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <Box display="flex" width="100%" flexDirection="row" marginTop="40px" marginBottom="24px">
      <Container ref={containerRef} sx={{ marginBottom: '150px' }}>
        <Box marginX="1%" maxWidth="98%">
          <Headers />

          <CustomTabs
            tabId="tab1"
            orientation="vertical"
            tabHeaderItems={[
              <SsidChartIcon key="tab1-0" sx={{ fontSize: '21px' }} />,
              <LineAxisIcon key="tab1-1" sx={{ fontSize: '21px' }} />
            ]}
            tabPanelItems={[
              <GraphicChart key="tab1-0-0" title="Histórico das Características" type="msg" value="characteristics" />,
              <GraphicChart
                key="tab1-1-1"
                title="Histórico das Características"
                type="line"
                value="characteristics"
                addHistoricalTSQMI
              />
            ]}
          />

          <CustomTabs
            tabId="tab2"
            orientation="vertical"
            tabHeaderItems={[
              <AiOutlineRadarChart key="tab2-0" fontSize="22px" />,
              <SpeedIcon key="tab2-1" sx={{ fontSize: '21px' }} />
            ]}
            tabPanelItems={[
              <GraphicChart
                key="tab2-0-0"
                title="Cénario atual das Características"
                type="radar"
                value="characteristics"
                valueType="latest-values"
                addCurrentGoal
              />,
              <GraphicChart
                key="tab2-0-1"
                title="Cénario atual das Características"
                type="gauge"
                autoGrid
                value="characteristics"
                valueType="latest-values"
                addCurrentGoal
              />
            ]}
          />

          <LatestValueTable title="Características" value="characteristics" />
          <GraphicChart title="Sub-Características" type="line" value="subcharacteristics" />
          <LatestValueTable title="Sub-Características" value="subcharacteristics" />
          <GraphicChart title="Medidas" type="line" value="measures" />
          <LatestValueTable title="Medidas" value="measures" />
          <GraphicChart title="Métricas" type="line" value="metrics" />
          <LatestValueTable title="Métricas" value="metrics" />
        </Box >
      </Container >
    </Box >
  );
};

Repository.getLayout = function getLayout(page) {
  return (
    <ProductConfigFilterProvider>
      <Layout rightSide={<TreeViewFilter />}> {page}</Layout >
    </ProductConfigFilterProvider >
  );
}

export default Repository;
