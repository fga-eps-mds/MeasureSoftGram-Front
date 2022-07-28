import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Moment from 'moment';
import { formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Box, Container, Typography } from '@mui/material';

import { NextPageWithLayout } from '@pages/_app.next';
import { projectQuery } from '@services/index';
import getLayout from '@components/Layout';

import Circle from './styles';
import { MeasureType } from '@types/MeasureTypes';

const DATE = 'DD/MM/YYYY';

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

  return (
    <>
      <Head>
        <title>MeasureSoftGram - Projetos</title>
      </Head>

      <Container>
        <Box display="flex" flexDirection="row">
          {measureResults.map((measureResult) => {
            return (
              <div style={{ borderWidth: 1, borderColor: 'red' }}>
                <Box display="flex" flexDirection="row" alignItems="center" marginX="20px" width={200}>
                  <Box>
                    <Typography variant="h6">{measureResult.name}</Typography>
                    <Typography variant="h6" textAlign={'center'}>
                      {measureResult.latest.value}
                    </Typography>
                    <Typography variant="caption">
                      Medido: {Moment(measureResult.latest.created_at).format(DATE)}
                    </Typography>
                  </Box>
                </Box>
              </div>
            );
          })}
        </Box>
      </Container>
    </>
  );
};

Measure.getLayout = getLayout;

export default Measure;
