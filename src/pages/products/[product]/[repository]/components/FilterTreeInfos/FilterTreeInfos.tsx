import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import Filters from '@components/Filters';
import Skeleton from '../Skeleton/Skeleton';
import * as Styles from './styles';

interface OptionCheckedProps {
  [key: string]: boolean;
}

interface Props {
  checkedOptions: OptionCheckedProps;
  setCheckedOptions: any;
  characteristics: Array<number> | Array<string>;
  subCharacteristics: Array<number> | Array<string>;
  measures: Array<number> | Array<string>;
  metrics: Array<number> | Array<string>;
}

const tree = {
  reliability: {
    testing_status: {
      passed_tests: {
        test_errors: true,
        test_failures: true,
        tests: true
      },
      test_builds: {
        test_execution_time: true
      },
      test_coverage: {
        coverage: true
      }
    }
  },
  maintainability: {
    modifiability: {
      non_complex_file_density: {
        complexity: true,
        functions: true
      },
      commented_file_density: {
        comment_lines_density: true
      },
      duplication_absense: {
        duplicated_lines_density: true
      }
    }
  }
};

const treeParentRelationship = {
  test_errors: 'passed_tests',
  test_failures: 'passed_tests',
  tests: 'passed_tests',
  test_execution_time: 'test_builds',
  coverage: 'test_coverage',
  complexity: 'non_complex_file_density',
  functions: 'non_complex_file_density',
  comment_lines_density: 'commented_file_density',
  duplicated_lines_density: 'duplication_absense',
  passed_tests: 'testing_status',
  test_builds: 'testing_status',
  test_coverage: 'testing_status',
  non_complex_file_density: 'modifiability',
  commented_file_density: 'modifiability',
  duplication_absense: 'modifiability',
  testing_status: 'reliability',
  modifiability: 'maintainability'
};

function FilterTreeInfos({
  checkedOptions,
  setCheckedOptions,
  characteristics,
  subCharacteristics,
  measures,
  metrics
}: Props) {
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

  useEffect(() => {
    if (!subCharacteristics || !measures || !metrics) {
      return;
    }

    const subCharacteristicsFilter = [];
    const measuresFilter = [];
    const metricsFilter = ['ncloc', 'files'];

    subCharacteristics.forEach((subCharacteristic) => {
      if (checkedOptions[treeParentRelationship[subCharacteristic]]) {
        subCharacteristicsFilter.push(subCharacteristic);
      }
    });

    measures.forEach((measure) => {
      if (checkedOptions[treeParentRelationship[measure]]) {
        measuresFilter.push(measure);
      }
    });

    metrics.forEach((metric) => {
      if (checkedOptions[treeParentRelationship[metric]]) {
        metricsFilter.push(metric);
      }
    });

    setFilterCharacteristics({ ...filterCharacteristics, options: characteristics, optionsShow: characteristics });
    setFilterSubCharacteristics({
      ...filterSubCharacteristics,
      options: subCharacteristics,
      optionsShow: subCharacteristicsFilter
    });
    setFilterMeasures({ ...filterMeasures, options: measures, optionsShow: measuresFilter });
    setFilterMetrics({ ...filterMetrics, options: metrics, optionsShow: metricsFilter });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characteristics, subCharacteristics, measures, metrics, checkedOptions]);

  const isArrayEmpty = (array: Array<any>) => array.length === 0;

  if (
    isArrayEmpty(filterCharacteristics.options) ||
    isArrayEmpty(filterSubCharacteristics.options) ||
    isArrayEmpty(filterMeasures.options) ||
    isArrayEmpty(filterMetrics.options) ||
    isArrayEmpty(Object.values(checkedOptions))
  ) {
    return <Skeleton />;
  }

  const handleMetric = (filteredItem, charc, subCharc, measure) => {
    const newFilteredItem = { ...filteredItem };
    Object.keys(tree[charc][subCharc][measure]).forEach((metric) => {
      newFilteredItem[metric] = false;
    });
    return newFilteredItem;
  };

  const handleMeasure = (filteredItem, charc, subCharc) => {
    let newFilteredItem = { ...filteredItem };
    Object.keys(tree[charc][subCharc]).forEach((measure) => {
      newFilteredItem[measure] = false;
      newFilteredItem = handleMetric(newFilteredItem, charc, subCharc, measure);
    });
    return newFilteredItem;
  };

  const handleSubCharacteristic = (filteredItem, charc) => {
    let newFilteredItem = { ...filteredItem };
    Object.keys(tree[charc]).forEach((subCharc) => {
      newFilteredItem[subCharc] = false;
      newFilteredItem = handleMeasure(newFilteredItem, charc, subCharc);
    });
    return newFilteredItem;
  };

  const handleFilter = (item) => {
    let filteredItem = { ...item };
    Object.keys(tree).forEach((charc) => {
      if (filteredItem[charc] === false) {
        filteredItem = handleSubCharacteristic(filteredItem, charc);
      } else {
        Object.keys(tree[charc]).forEach((subCharc) => {
          if (filteredItem[subCharc] === false) {
            filteredItem = handleMeasure(filteredItem, charc, subCharc);
          } else {
            Object.keys(tree[charc][subCharc]).forEach((measure) => {
              if (filteredItem[measure] === false) {
                filteredItem = handleMetric(filteredItem, charc, subCharc, measure);
              }
            });
          }
        });
      }
    });
    setCheckedOptions(filteredItem);
  };

  return (
    <Styles.FilterBackground>
      <Box
        display="flex"
        paddingX="10px"
        flexDirection="column"
        marginTop="0px"
        position="fixed"
        overflow="auto"
        maxHeight="85vh"
      >
        {[filterCharacteristics, filterSubCharacteristics, filterMeasures, filterMetrics].map((filter) => (
          <Filters
            data-testid="reliability-checkbox"
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
  );
}

export default FilterTreeInfos;
