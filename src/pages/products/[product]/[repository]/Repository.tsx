import React, { useEffect, useState } from 'react';
import { Box, Container, Typography } from '@mui/material';

import Filters from '@components/Filters';
import getLayout from '@components/Layout';
import GraphicStackedLine from '@components/GraphicStackedLine';

import { NextPageWithLayout } from '@pages/_app.next';

import { useRepositoryContext } from '@contexts/RepositoryProvider';

import Skeleton from './components/Skeleton';
import HistoricalLatestInfos from './components/HistoricalInfosList';
import LatestValueTable from './components/LatestValueTable';

import { useQuery as useQueryProduct } from '../hooks/useQuery';
import { useQuery } from './hooks/useQuery';

import * as Styles from './styles';

interface FilterProps {
  filterTitle: string;
  options: Array<string>;
  optionsShow: Array<string>;
}


const tree = {
  'reliability': {
    'testing_status': {
      'passed_tests': {
        'test_errors': true,
        'test_failures': true,
        'tests': true
      },
      'test_builds' : {
        'test_execution_time': true
      },
      'test_coverage': {
        'coverage': true
      }
    }
  },
  'maintainability': {
    'modifiability': {
      'non_complex_file_density': {
        'complexity': true,
        'functions': true
      },
      'commented_file_density': {
        'comment_lines_density': true
      },
      'duplication_absense' : {
        'duplicated_lines_density': true
      }
    }
  }
}

const treeParentRelationship = {
  'test_errors': 'passed_tests',
  'test_failures': 'passed_tests',
  'tests': 'passed_tests',
  'test_execution_time': 'test_builds',
  'coverage': 'test_coverage',
  'complexity': 'non_complex_file_density',
  'functions': 'non_complex_file_density',
  'comment_lines_density': 'commented_file_density',
  'duplicated_lines_density': 'duplication_absense',
  'passed_tests': 'testing_status',
  'test_builds': 'testing_status',
  'test_coverage': 'testing_status',
  'non_complex_file_density': 'modifiability',
  'commented_file_density': 'modifiability',
  'duplication_absense': 'modifiability',
  'testing_status': 'reliability',
  'modifiability': 'maintainability'
}

const Repository: NextPageWithLayout = () => {
  useQueryProduct();

  const { repositoryHistoricalCharacteristics, latestValueCharacteristics, checkedOptionsFormat } = useQuery();
  const { characteristics, subCharacteristics, measures, metrics, currentRepository, historicalSQC } = useRepositoryContext();

  const [filterCharacteristics, setFilterCharacteristics] = useState<FilterProps>({
    filterTitle: 'CARACTERÍSTICAS',
    options: [],
    optionsShow: []
  });
  const [filterSubCharacteristics, setFilterSubCharacteristics] = useState<FilterProps>({
    filterTitle: 'SUB CARACTERÍSTICAS',
    options: [],
    optionsShow: []
  });
  const [filterMeasures, setFilterMeasures] = useState<FilterProps>({
    filterTitle: 'MEDIDAS',
    options: [],
    optionsShow: []
  });
  const [filterMetrics, setFilterMetrics] = useState<FilterProps>({
    filterTitle: 'MÉTRICAS',
    options: [],
    optionsShow: []
  });

  const [checkedOptions, setCheckedOptions] = useState(checkedOptionsFormat);

  
  useEffect(() => {
    setCheckedOptions(checkedOptionsFormat);
  }, [checkedOptionsFormat]);


  useEffect(() => {
    const subCharacteristicsFilter = [];
    const measuresFilter = [];
    const metricsFilter = ['ncloc', 'files'];

    subCharacteristics.filter((subCharacteristic) => {
      if (checkedOptions[treeParentRelationship[subCharacteristic]]){
        subCharacteristicsFilter.push(subCharacteristic);
      }
    });

    measures.filter((measure) => {
      if (checkedOptions[treeParentRelationship[measure]]){
        measuresFilter.push(measure);
      }
    });

    metrics.filter((metric) => {
      if (checkedOptions[treeParentRelationship[metric]]){
        metricsFilter.push(metric);
      }  
    });


    setFilterCharacteristics({ ...filterCharacteristics, options: characteristics, optionsShow: characteristics });
    setFilterSubCharacteristics({ ...filterSubCharacteristics, options: subCharacteristics, optionsShow: subCharacteristicsFilter });
    setFilterMeasures({ ...filterMeasures, options: measures, optionsShow: measuresFilter });
    setFilterMetrics({ ...filterMetrics, options: metrics, optionsShow: metricsFilter });
  }, [characteristics, subCharacteristics, measures, metrics, checkedOptions]);

  const isArrayEmpty = (array: Array<any>) => array.length === 0;


  if (
    isArrayEmpty(repositoryHistoricalCharacteristics) ||
    isArrayEmpty(latestValueCharacteristics) ||
    isArrayEmpty(filterCharacteristics.options) ||
    isArrayEmpty(filterSubCharacteristics.options) ||
    isArrayEmpty(filterMeasures.options) ||
    isArrayEmpty(filterMetrics.options) ||
    !currentRepository ||
    !historicalSQC
  ) {
    return <Skeleton />;
  }


  const handleFilter = (item) => {
    for (const charc in tree) {
      if (item[charc] === false) {
        for (const subCharc in tree[charc]) {
          item[subCharc] = false;
          for (const measure in tree[charc][subCharc]) {
            item[measure] = false;
            for (const metric in tree[charc][subCharc][measure]) {
              item[metric] = false;
            }
          }
        }
      }
      else {
        for (const subCharc in tree[charc]) {
          if (item[subCharc] === false) {
            for (const measure in tree[charc][subCharc]) {
              item[measure] = false;
              for (const metric in tree[charc][subCharc][measure]) {
                item[metric] = false;
              }
            }
          }
          else {
            for (const measure in tree[charc][subCharc]) {
              if (item[measure] === false) {
                for (const metric in tree[charc][subCharc][measure]) {
                  item[metric] = false;
                }
              }
            }
          }
        }        
      }
    }
    setCheckedOptions(item);
  };

  
  return (
    <Box display="flex" width="100%" flexDirection="row">
      <Styles.FilterBackground>
        <Box display="flex" paddingX="10px" flexDirection="column" marginTop="0px" position="fixed" overflow="auto" maxHeight="85vh">
          {[filterCharacteristics, filterSubCharacteristics, filterMeasures, filterMetrics].map((filter) => (
            <Filters
              key={filter.filterTitle}
              filterTitle={filter.filterTitle}
              options={filter.options}
              updateOptions={handleFilter}
              checkedOptions={checkedOptions}
              optionsShow={filter.optionsShow}
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

              <LatestValueTable 
                title="Características"
                latestValue={latestValueCharacteristics}/>

              </Box>
            
          </Container>
        </Box>

        {/* <SubCharacteristicsList checkedOptions={checkedOptions} /> */}

        {/* <HistoricalInfosList checkedOptions={checkedOptions}/> */}

        <HistoricalLatestInfos checkedOptions={checkedOptions}/>

          
        
      </Box>
    </Box>
    
    );
};

Repository.getLayout = getLayout;

export default Repository;
