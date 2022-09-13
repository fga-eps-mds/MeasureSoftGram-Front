import axios from 'axios';
import React, { useEffect, useState } from 'react';

import Filters from '@components/Filters';
import getLayout from '@components/Layout';
import GraphicStackedLine from '@components/GraphicStackedLine';

import CreateRelease from '@pages/createRelease';
import { NextPageWithLayout } from '@pages/_app.next';

import { supportedEntitiesQuery } from '@services/supportedEntities';
import { historical } from '@services/historicalCharacteristics';

import formatEntitiesFilter from '@utils/formatEntitiesFilter';

import * as Styles from './styles';
// import Skeleton from './components/Skeleton';

interface FilterProps {
  filterTitle: string;
  options: Array<string>;
}

const LARGE_PRIME_NUMBER = 907111937;

const Repository: NextPageWithLayout = () => {
  const [filterCharacteristics, setFilterCharacteristics] = useState<FilterProps>({
    filterTitle: 'CARACTERÍSTICAS',
    options: []
  });
  const [filterSubCharacteristics, setFilterSubCharacteristics] = useState<FilterProps>({
    filterTitle: 'SUB CARACTERÍSTICAS',
    options: []
  });

  const [checkedOptions, setCheckedOptions] = useState({});

  const [sqcValues, setSqcValues] = useState<Object>({});

  const [historicalCharacteristics, setHistoricalCharacteristics] = useState([]);
  const [organizationId, setOrganizationId] = useState(1);
  const [productId, setProductId] = useState(3);
  const [repositoryId, setRepositoryId] = useState(6);

  useEffect(() => {
    axios
      .all([
        supportedEntitiesQuery.getSupportedEntities(organizationId, productId),
        // supportedEntitiesQuery.getSupportedEntities('subcharacteristics'),
        historical.getHistoricalCharacteristics({
          organizationId,
          productId,
          repositoryId,
          entity: 'characteristics'
        }),
        historical.getSqcHistory(organizationId, productId, repositoryId)
      ])
      .then((res) => {
        let map = {};
        const results = res.map((result) => result.data.results || result.data.data);

        const [characteristics, subCharacteristics] = formatEntitiesFilter(results[0].characteristics);
        const id = Math.round(Math.random() * LARGE_PRIME_NUMBER);
        const sqcOptions = { id, key: 'SQC', name: 'SQC', history: results[2] };

        setSqcValues(sqcOptions);

        const historicalValues = results[1];
        historicalValues.push(sqcOptions);

        setFilterCharacteristics({
          ...filterCharacteristics,
          options: characteristics
        });
        setFilterSubCharacteristics({ ...filterSubCharacteristics, options: subCharacteristics });

        [characteristics, subCharacteristics].forEach((result: Array<string>) => {
          result.forEach((option) => {
            map = {
              ...map,
              [option]: false
            };
          });
        });

        setCheckedOptions(map);
        setHistoricalCharacteristics(historicalValues);
      });
  }, []);

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
        {historicalCharacteristics.length !== 0 && (
          <GraphicStackedLine historical={historicalCharacteristics} checkedOptions={checkedOptions} />
        )}
      </Styles.GraphicContainer>
    </Styles.BodyContainer>
  );
};

Repository.getLayout = getLayout;

export default Repository;
