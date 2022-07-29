import React, { useEffect, useState } from 'react';

import ReactEcharts, { EChartsOption } from 'echarts-for-react';
import { Box, Container, Grid, Typography } from '@mui/material';

import formatMeasuresHistoryChartData from '@utils/formatMeasuresHistory';
import { MeasuresHistoryResult } from '@customTypes/project';

import { NextPageWithLayout } from '@pages/_app.next';
import getLayout from '@components/Layout';

import { MeasureType } from 'src/shared/types/MeasureTypes';
import { formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { projectQuery } from '@services/index';
import useQuery from './hooks/useQuery';
import BoxStyle from './styles';

const subcategories = [
  { name: 'Funcionalidade', measures: [1, 2, 3] },
  { name: 'Confiabilidade', measures: [] },
  { name: 'Usabilidade', measures: [] },
  { name: 'Eficiência', measures: [4] },
  { name: 'Manutenibilidade', measures: [5] },
  { name: 'Portabilidade', measures: [6] }
];

const resultMock = {
  projectId: 1,
  organizationId: 1,
  name: '2022-1-MeasureSoftGram-Front-Medidas',
  description: 'Repositório Frontend do software MeasureSoftGram.',
  github_url: 'https://github.com/fga-eps-mds/2022-1-MeasureSoftGram-Front',
  created_at: '2022-07-14T020:00:55.603466',
  updated_at: '2022-07-15T08:58:55.603466'
};

const Measures: NextPageWithLayout = () => {
  const [chartOptions, setChartOptions] = useState<EChartsOption>();
  const [measureResults, setMeasureResults] = useState<Array<MeasureType>>([]);

  const { projectMeasuresHistory } = useQuery();

  useEffect(() => {
    if (!projectMeasuresHistory) return;

    const formatedCharOptions = formatMeasuresHistoryChartData(
      projectMeasuresHistory?.results as Array<MeasuresHistoryResult>
    );
    setChartOptions(formatedCharOptions);
  }, [projectMeasuresHistory]);

  useEffect(() => {
    const getMeasureFromAPI = async () => {
      const organizationId = resultMock.organizationId.toString();
      const projectId = resultMock.projectId.toString();

      const {
        data: { results }
      } = await projectQuery.getAllMeasures(organizationId, projectId);
      return results;
    };
    getMeasureFromAPI()
      .then((response) => {
        setMeasureResults(response);
      })
      .catch(console.error);
  }, []);

  const lastUpdateDate = formatRelative(new Date(resultMock.updated_at), new Date(), {
    locale: ptBR
  });

  if (!chartOptions) {
    return null;
  }

  const renderMeasures = (subcategoryMeasures: any) =>
    measureResults.map((measureResult) => {
      if (subcategoryMeasures.indexOf(measureResult.id) > -1) {
        return (
          <Grid item xs={3} marginBottom="32px">
            <Box borderRadius="16px" padding="16px" color="#fff" sx={BoxStyle} textAlign="center">
              <Typography variant="h6" paddingBottom="4px">
                {measureResult.name}
              </Typography>
              <Typography variant="h6" paddingBottom="4px">
                Valor: {measureResult.latest.value.toFixed(2)}
              </Typography>
              <Typography variant="caption">Última medida: {lastUpdateDate}</Typography>
            </Box>
          </Grid>
        );
      }
      return null;
    });

  const renderSubcategories = () =>
    subcategories.map((subcategory) => {
      if (subcategory.measures.length > 0)
        return (
          <>
            <Typography variant="h5" marginTop="16px">
              {subcategory.name}
            </Typography>
            <Grid container spacing={3} marginTop="16px">
              {renderMeasures(subcategory.measures)}
            </Grid>
          </>
        );
      return null;
    });

  return (
    <Container>
      <Grid marginTop="32px">{renderSubcategories()}</Grid>
      <Box marginY="60px" data-testid="measures">
        <ReactEcharts option={chartOptions} style={{ height: '600px', width: '100%' }} />
      </Box>
    </Container>
  );
};

Measures.getLayout = getLayout;

export default Measures;
