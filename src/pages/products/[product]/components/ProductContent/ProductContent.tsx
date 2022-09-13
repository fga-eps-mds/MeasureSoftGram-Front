import axios from 'axios';
import React, { useEffect, useState } from 'react';

import { formatRelative } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import { MoreVert } from '@mui/icons-material';

import { Product, RepositoriesSqcHistory } from '@customTypes/product';

import Filters from '@components/Filters';
import GraphicStackedLine from '@components/GraphicStackedLine';
import GraphicRepositoriesSqcHistory from '@components/GraphicRepositoriesSqcHistory';

import CreateRelease from '@pages/createRelease';

import { supportedEntitiesQuery } from '@services/supportedEntities';
import { historical } from '@services/historicalCharacteristics';

import formatEntitiesFilter from '@utils/formatEntitiesFilter';

import { useProductContext } from '@contexts/ProductProvider';
import * as Styles from './styles';
import Skeleton from '../Skeleton';

interface Props {
  repositoriesSqcHistory?: RepositoriesSqcHistory;
}

interface FilterProps {
  filterTitle: string;
  options: Array<string>;
}

const LARGE_PRIME_NUMBER = 907111937;

const ProductContent: React.FC<Props> = ({ repositoriesSqcHistory }) => {
  const { currentProduct } = useProductContext();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const [openCreateRelease, setOpenCreateRelease] = useState(false);

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

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenCreateRelease = () => {
    setOpenCreateRelease(true);
    setAnchorEl(null);
  };

  const lastUpdateDate =
    currentProduct &&
    formatRelative(new Date(), new Date(), {
      locale: ptBR
    });

  if (!currentProduct) {
    return <Skeleton />;
  }

  return (
    <>
      <Box display="flex" flexDirection="column">
        <Box display="flex" flexDirection="row" alignItems="center" marginY="60px">
          <Styles.Circle />

          <Box>
            <Typography variant="h6">{currentProduct?.name}</Typography>
            <Typography variant="caption">última atualização: {lastUpdateDate}</Typography>
          </Box>

          <IconButton color="primary" onClick={handleOpenMenu}>
            <MoreVert />
          </IconButton>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleCloseMenu}
            MenuListProps={{
              'aria-labelledby': 'basic-button'
            }}
          >
            <MenuItem onClick={handleOpenCreateRelease}>Definir release</MenuItem>
          </Menu>
        </Box>
      </Box>

      <GraphicRepositoriesSqcHistory history={repositoriesSqcHistory} />

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

      <CreateRelease
        open={openCreateRelease}
        handleClose={() => setOpenCreateRelease(false)}
        productId={3}
        organizationId={1}
      />
    </>
  );
};

export default ProductContent;
