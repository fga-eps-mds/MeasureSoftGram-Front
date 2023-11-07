import React, { useState } from 'react';

import { NextPageWithLayout } from '@pages/_app.next';

import { Box, Container } from '@mui/material';
import SsidChartIcon from '@mui/icons-material/SsidChart';
import LineAxisIcon from '@mui/icons-material/LineAxis';
import SpeedIcon from '@mui/icons-material/Speed';
import TableRowsIcon from '@mui/icons-material/TableRows';

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
import OptionsHeader from './components/OptionsHeader/OptionsHeader';

const Repository: NextPageWithLayout = () => {
  useRequireAuth();
  useQuery();

  const [isHistoricCharacteristicOpen, setIsHistoricCharacteristicOpen] = useState(true);
  const [isHistoricSubCharacteristicOpen, setIsHistoricSubCharacteristicOpen] = useState(true);
  const [isHistoricMeasureOpen, setIsHistoricMeasureOpen] = useState(true);

  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <Box display="flex" width="100%" flexDirection="row" marginTop="40px" marginBottom="24px">
      <Container ref={containerRef} sx={{ marginBottom: '150px' }}>
        <Box marginX="1%" maxWidth="98%">
          <Headers />

          <OptionsHeader
            title='Características'
            isHistoricOpen={isHistoricCharacteristicOpen}
            setIsHistoricOpen={setIsHistoricCharacteristicOpen}
          />
          {
            isHistoricCharacteristicOpen ?
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
              :
              <CustomTabs
                tabId="tab2"
                orientation="vertical"
                tabHeaderItems={[
                  <AiOutlineRadarChart key="tab2-0" fontSize="22px" />,
                  <SpeedIcon key="tab2-1" sx={{ fontSize: '21px' }} />,
                  <TableRowsIcon key="tab2-2" sx={{ fontSize: '21px' }} />,
                ]}
                tabPanelItems={[
                  <GraphicChart
                    key="tab2-0-0"
                    title="Cenário atual das Características"
                    type="radar"
                    value="characteristics"
                    valueType="latest-values"
                    addCurrentGoal
                  />,
                  <GraphicChart
                    key="tab2-0-1"
                    title="Cenário atual das Características"
                    type="gauge"
                    autoGrid
                    value="characteristics"
                    valueType="latest-values"
                    addCurrentGoal
                  />,
                  <LatestValueTable
                    key="tab2-0-2"
                    title="Características"
                    value="characteristics"
                  />
                ]}
              />

          }

          <OptionsHeader
            title='Sub-Características'
            isHistoricOpen={isHistoricSubCharacteristicOpen}
            setIsHistoricOpen={setIsHistoricSubCharacteristicOpen}
          />
          {
            isHistoricSubCharacteristicOpen ?
              <CustomTabs
                tabId="tab1"
                orientation="vertical"
                tabHeaderItems={[
                  <LineAxisIcon key="tab1-0" sx={{ fontSize: '21px' }} />
                ]}
                tabPanelItems={[
                  <GraphicChart key="tab1-0-0" title="Sub-Características" type="line" value="subcharacteristics" />
                ]}
              />
              :
              <CustomTabs
                tabId="tab2"
                orientation="vertical"
                tabHeaderItems={[
                  <AiOutlineRadarChart key="tab2-0" fontSize="22px" />,
                  <SpeedIcon key="tab2-1" sx={{ fontSize: '21px' }} />,
                  <TableRowsIcon key="tab2-2" sx={{ fontSize: '21px' }} />
                ]}
                tabPanelItems={[
                  <GraphicChart
                    key="tab2-0-0"
                    title="Cenário atual das Sub-Características"
                    type="radar"
                    value="subcharacteristics"
                    valueType="latest-values"
                    addCurrentGoal
                  />,
                  <GraphicChart
                    key="tab2-0-1"
                    title="Cenário atual das Sub-Características"
                    type="gauge"
                    autoGrid
                    value="subcharacteristics"
                    valueType="latest-values"
                    addCurrentGoal
                  />,
                  <LatestValueTable
                    key="tab2-0-2"
                    title="Sub-Características"
                    value="subcharacteristics"
                  />
                ]}
              />

          }

          <OptionsHeader
            title='Medidas'
            isHistoricOpen={isHistoricMeasureOpen}
            setIsHistoricOpen={setIsHistoricMeasureOpen}
          />
          {
            isHistoricMeasureOpen ?
              <CustomTabs
                tabId="tab1"
                orientation="vertical"
                tabHeaderItems={[
                  <LineAxisIcon key="tab1-0" sx={{ fontSize: '21px' }} />,
                ]}
                tabPanelItems={[
                  <GraphicChart key="tab1-0-0" title="Medidas" type="line" value="measures" />
                ]}

              />
              :
              <CustomTabs
                tabId="tab2"
                orientation="vertical"
                tabHeaderItems={[
                  <AiOutlineRadarChart key="tab2-0" fontSize="22px" />,
                  <SpeedIcon key="tab2-1" sx={{ fontSize: '21px' }} />,
                  <TableRowsIcon key="tab2-2" sx={{ fontSize: '21px' }} />

                ]}
                tabPanelItems={[
                  <GraphicChart
                    key="tab2-0-0"
                    title="Cenário atual das Medidas"
                    type="radar"
                    value="measures"
                    valueType="latest-values"
                    addCurrentGoal
                  />,
                  <GraphicChart
                    key="tab2-0-1"
                    title="Cenário atual das Medidas"
                    type="gauge"
                    autoGrid
                    value="measures"
                    valueType="latest-values"
                    addCurrentGoal
                  />,
                  <LatestValueTable
                    key="tab2-0-2"
                    title="Medidas"
                    value="measures"
                  />
                ]}
              />
          }

          <Box
            display="flex"
            flexDirection="row"
            height={60}
            alignItems="center"
          >
            <h2 style={{ color: '#113D4C', fontWeight: '500', fontSize: '25px' }}>Métricas</h2>
          </Box>
          <GraphicChart title="Métricas" type="line" value="metrics" />
          <Box marginY="12px">
            <LatestValueTable title="Métricas" value="metrics" />
          </Box>
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
