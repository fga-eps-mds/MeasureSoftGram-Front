import React, { useEffect, useState } from 'react';
import { Box, Container, Typography } from '@mui/material';

import Filters from '@components/Filters';
import getLayout from '@components/Layout';
import GraphicStackedLine from '@components/GraphicStackedLine';

import { NextPageWithLayout } from '@pages/_app.next';

import { useRepositoryContext } from '@contexts/RepositoryProvider';
import { useQuery as useQueryProduct } from '../hooks/useQuery';

import { useQuery } from './hooks/useQuery';

import * as Styles from './styles';

interface FilterProps {
  filterTitle: string;
  options: Array<string>;
}

const Repository: NextPageWithLayout = () => {
  useQueryProduct();

  const { repositoryHistoricalCharacteristics, repositoryHistoricalSqc, checkedOptionsFormat } = useQuery();
  const { characteristics, subCharacteristics, currentRepository } = useRepositoryContext();

  const [filterCharacteristics, setFilterCharacteristics] = useState<FilterProps>({
    filterTitle: 'CARACTERÍSTICAS',
    options: []
  });
  const [filterSubCharacteristics, setFilterSubCharacteristics] = useState<FilterProps>({
    filterTitle: 'SUB CARACTERÍSTICAS',
    options: []
  });

  const [checkedOptions, setCheckedOptions] = useState(checkedOptionsFormat);

  useEffect(() => {
    setFilterCharacteristics({ ...filterCharacteristics, options: characteristics });
    setFilterSubCharacteristics({ ...filterSubCharacteristics, options: subCharacteristics });
  }, [characteristics, subCharacteristics]);

  return (
    <Box display="flex" width="100%" flexDirection="row">
      <Styles.FilterBackground>
        <Box display="flex" paddingX="15px" flexDirection="column" marginTop="36px">
          {[filterCharacteristics, filterSubCharacteristics].map((filter) => (
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

          {repositoryHistoricalSqc &&
            repositoryHistoricalCharacteristics &&
            repositoryHistoricalCharacteristics.length !== 0 && (
              <GraphicStackedLine
                historical={repositoryHistoricalCharacteristics.concat(repositoryHistoricalSqc)}
                checkedOptions={checkedOptions}
              />
            )}
        </Box>
      </Container>
    </Box>
  );
};

Repository.getLayout = getLayout;

export default Repository;
