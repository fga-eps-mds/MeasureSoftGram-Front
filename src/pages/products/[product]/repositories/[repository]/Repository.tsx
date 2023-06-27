import React from 'react';

import { NextPageWithLayout } from '@pages/_app.next';

import { Box, Container } from '@mui/material';
import SsidChartIcon from '@mui/icons-material/SsidChart';
import LineAxisIcon from '@mui/icons-material/LineAxis';
import SpeedIcon from '@mui/icons-material/Speed';

import { AiOutlineRadarChart } from 'react-icons/ai';

import useRequireAuth from '@hooks/useRequireAuth';

import getLayout from '@components/Layout';
import GraphicChart from '@components/GraphicChart';
import LatestValueTable from '@components/LatestValueTable';

import Headers from './components/Header';
import CustomTabs from './components/CustomTabs';

import { useQuery } from './hooks/useQuery';

const Repository: NextPageWithLayout = () => {
  useRequireAuth();
  useQuery();

  return (
    <Box display="flex" width="100%" flexDirection="row" marginTop="40px" marginBottom="24px">
      <Container sx={{ marginBottom: '150px', maxWidth: '100%' }}>
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
              addHistoricalSQC
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
            />,
            <GraphicChart
              key="tab2-0-1"
              title="Cénario atual das Características"
              type="gauge"
              value="characteristics"
              valueType="latest-values"
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
      </Container>
    </Box>
  );
};

Repository.getLayout = getLayout;

export default Repository;
