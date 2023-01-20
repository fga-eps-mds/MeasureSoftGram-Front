import React, { useEffect, useState } from 'react';
import { Box, Container, Typography } from '@mui/material';

import Filters from '@components/Filters';
import getLayout from '@components/Layout';
import GraphicStackedLine from '@components/GraphicStackedLine';

import { NextPageWithLayout } from '@pages/_app.next';

import { useRepositoryContext } from '@contexts/RepositoryProvider';

import Skeleton from './components/Skeleton';
import SubCharacteristicsList from './components/SubCharacteristicsList';
import MeasuresList from './components/MeasuresList';
import MetricsList from './components/MetricsList';

import { useQuery as useQueryProduct } from '../hooks/useQuery';
import { useQuery } from './hooks/useQuery';

import * as Styles from './styles';

interface FilterProps {
  filterTitle: string;
  options: Array<string>;
}

const Repository: NextPageWithLayout = () => {
  useQueryProduct();

  const { repositoryHistoricalCharacteristics, repositoryHistoricalMeasures, repositoryHistoricalMetrics, checkedOptionsFormat } = useQuery();
  const { characteristics, subCharacteristics, measures, metrics, currentRepository, historicalSQC } = useRepositoryContext();

  // console.log('Metrics', metrics)
  console.log('Historical Measures', repositoryHistoricalMetrics)

  const [filterCharacteristics, setFilterCharacteristics] = useState<FilterProps>({
    filterTitle: 'CARACTERÍSTICAS',
    options: []
  });
  const [filterSubCharacteristics, setFilterSubCharacteristics] = useState<FilterProps>({
    filterTitle: 'SUB CARACTERÍSTICAS',
    options: []
  });
  const [filterMeasures, setFilterMeasures] = useState<FilterProps>({
    filterTitle: 'MEDIDAS',
    options: []
  });
  const [filterMetrics, setFilterMetrics] = useState<FilterProps>({
    filterTitle: 'MÉTRICAS',
    options: []
  });


  const [checkedOptions, setCheckedOptions] = useState(checkedOptionsFormat);

  useEffect(() => {
    setCheckedOptions(checkedOptionsFormat);
  }, [checkedOptionsFormat]);

  useEffect(() => {
    setFilterCharacteristics({ ...filterCharacteristics, options: characteristics });
    setFilterSubCharacteristics({ ...filterSubCharacteristics, options: subCharacteristics });
    setFilterMeasures({ ...filterMeasures, options: measures });
    setFilterMetrics({ ...filterMetrics, options: metrics });
  }, [characteristics, subCharacteristics, measures, metrics]);

  const isArrayEmpty = (array: Array<any>) => array.length === 0;

  if (
    isArrayEmpty(repositoryHistoricalCharacteristics) ||
    isArrayEmpty(repositoryHistoricalMeasures) ||
    isArrayEmpty(repositoryHistoricalMetrics) ||
    isArrayEmpty(filterCharacteristics.options) ||
    isArrayEmpty(filterSubCharacteristics.options) ||
    isArrayEmpty(filterMeasures.options) ||
    isArrayEmpty(filterMetrics.options) ||
    !currentRepository ||
    !historicalSQC
  ) {
    return <Skeleton />;
  }

  // console.log(currentRepository)

  return (
    <Box display="flex" width="100%" flexDirection="row">
      <Styles.FilterBackground>
        <Box display="flex" paddingX="15px" flexDirection="column" marginTop="36px" position="fixed">
          {[filterCharacteristics, filterSubCharacteristics, filterMeasures, filterMetrics].map((filter) => (
            <Filters
              key={filter.filterTitle}
              filterTitle={filter.filterTitle}
              options={filter.options}
              updateOptions={setCheckedOptions}
              checkedOptions={checkedOptions}
            />
          ))}
        </Box>
      </Styles.FilterBackground>

      <Box width="100%">
        <Box marginBottom="42px">
          <Container>
            <Box display="flex" flexDirection="column" width="100%">
              <Box marginTop="40px" marginBottom="36px">
                <Box display="flex">
                  <Typography variant="h4" marginRight="10px">
                    Repositório
                  </Typography>
                  <Typography variant="h4" fontWeight="300">
                    {currentRepository?.name}
                  </Typography>
                </Box>

                <Typography variant="caption" color="gray">
                  {currentRepository?.description}
                </Typography>
              </Box>

              {historicalSQC &&
                repositoryHistoricalCharacteristics &&
                repositoryHistoricalCharacteristics.length !== 0 && (
                  <GraphicStackedLine
                    historical={repositoryHistoricalCharacteristics.concat(historicalSQC)}
                    checkedOptions={checkedOptions}
                    title="Características"
                  />
                )}
            </Box>
          </Container>
        </Box>

        {/* <MeasuresList />
        
        
        <MetricsList /> */}

        <SubCharacteristicsList checkedOptions={checkedOptions} />
        

        <Box marginBottom="42px">
          <Container>
            <Box display="flex" flexDirection="column" width="100%">
              <Box marginTop="20px" marginBottom="16px">
                <Typography variant="caption" color="gray">
                  {currentRepository?.description}
                </Typography>
              </Box>
              {repositoryHistoricalMeasures &&
                repositoryHistoricalMeasures.length !== 0 && (
                  <GraphicStackedLine
                    historical={repositoryHistoricalMeasures}
                    checkedOptions={checkedOptions}
                    title="Medidas"
                  />
                )}
            </Box>
          </Container>
        </Box>

        <Box marginBottom="42px">
          <Container>
            <Box display="flex" flexDirection="column" width="100%">
              <Box marginTop="20px" marginBottom="16px">
                <Typography variant="caption" color="gray">
                  {currentRepository?.description}
                </Typography>
              </Box>
              {repositoryHistoricalMetrics &&
                repositoryHistoricalMetrics.length !== 0 && (
                  <GraphicStackedLine
                    historical={repositoryHistoricalMetrics}
                    checkedOptions={checkedOptions}
                    title="Métricas"
                  />
                )}
              </Box>
          </Container>
        </Box>

        
      </Box>
    </Box>
  );
};

Repository.getLayout = getLayout;

export default Repository;
