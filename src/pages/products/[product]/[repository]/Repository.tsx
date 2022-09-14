import axios from 'axios';
import React, { useEffect, useState } from 'react';

import Filters from '@components/Filters';
import getLayout from '@components/Layout';
import GraphicStackedLine from '@components/GraphicStackedLine';

import { NextPageWithLayout } from '@pages/_app.next';

import { useRepositoryContext } from '@contexts/RepositoryProvider';
import * as Styles from './styles';
import { useQuery } from './hooks/useQuery';
// import Skeleton from './components/Skeleton';

interface FilterProps {
  filterTitle: string;
  options: Array<string>;
}

const Repository: NextPageWithLayout = () => {
  const { repositoryHistoricalCharacteristics, repositoryHistoricalSqc, checkedOptionsFormat } = useQuery();
  const { currentRepository, characteristics, subCharacteristics } = useRepositoryContext();

  const [filterCharacteristics, setFilterCharacteristics] = useState<FilterProps>({
    filterTitle: 'CARACTERÍSTICAS',
    options: []
  });
  const [filterSubCharacteristics, setFilterSubCharacteristics] = useState<FilterProps>({
    filterTitle: 'SUB CARACTERÍSTICAS',
    options: []
  });

  const [checkedOptions, setCheckedOptions] = useState(checkedOptionsFormat);

  const [sqcValues, setSqcValues] = useState<Object>({});

  const [historicalCharacteristics, setHistoricalCharacteristics] = useState([]);
  const [organizationId, setOrganizationId] = useState(1);
  const [productId, setProductId] = useState(3);

  useEffect(() => {
    setFilterCharacteristics({ ...filterCharacteristics, options: characteristics });
    setFilterSubCharacteristics({ ...filterSubCharacteristics, options: subCharacteristics });
  }, [characteristics, subCharacteristics]);

  // if (!product) {
  //   return <Skeleton />;
  // }

  return (
    <Styles.BodyContainer display="flex" width="100%" flexDirection="row">
      <Styles.FiltersContainer display="flex" width="30%" flexDirection="column">
        {[filterCharacteristics, filterSubCharacteristics].map((filter) => (
          <Filters
            key={filter.filterTitle}
            filterTitle={filter.filterTitle}
            options={filter.options}
            updateOptions={setCheckedOptions}
            checkedOptions={checkedOptions}
          />
        ))}
      </Styles.FiltersContainer>

      <Styles.GraphicContainer display="flex" width="100%" justifyContent="center" alignItems="center">
        {repositoryHistoricalSqc &&
          repositoryHistoricalCharacteristics &&
          repositoryHistoricalCharacteristics.length !== 0 && (
            <GraphicStackedLine
              historical={repositoryHistoricalCharacteristics.concat(repositoryHistoricalSqc)}
              checkedOptions={checkedOptions}
            />
          )}
      </Styles.GraphicContainer>
    </Styles.BodyContainer>
  );
};

Repository.getLayout = getLayout;

export default Repository;
