import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Box, Grid, Typography, Container } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';
import { projectQuery } from '@services/index';
import getLayout from '@components/Layout';

import { MeasureType } from '@types/MeasureTypes';
import BoxStyle from './styles';

const subcategories = [
  { name: 'Funcionalidade', measures: [1, 2, 3] },
  { name: 'Confiabilidade', measures: [] },
  { name: 'Usabilidade', measures: [] },
  { name: 'Eficiência', measures: [4] },
  { name: 'Manutenibilidade', measures: [5] },
  { name: 'Portabilidade', measures: [6] }
];

const Measure: NextPageWithLayout = () => {
  const resultMock = {
    projectId: 1,
    organizationId: 1,
    name: '2022-1-MeasureSoftGram-Front-Medidas',
    description: 'Repositório Frontend do software MeasureSoftGram.',
    github_url: 'https://github.com/fga-eps-mds/2022-1-MeasureSoftGram-Front',
    created_at: '2022-07-14T020:00:55.603466',
    updated_at: '2022-07-15T08:58:55.603466'
  };

  const [measureResults, setMeasureResults] = useState<Array<MeasureType>>([]);

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
    <>
      <Head>
        <title>MeasureSoftGram - Projetos</title>
      </Head>
      <Container>
        <Grid marginTop="32px">{renderSubcategories()}</Grid>
      </Container>
    </>
  );
};

Measure.getLayout = getLayout;

export default Measure;
