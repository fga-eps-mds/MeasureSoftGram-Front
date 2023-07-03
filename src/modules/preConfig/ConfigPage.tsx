import React, { useEffect, useState } from 'react';

import { Alert, Box, Checkbox, Snackbar, Switch, Typography } from '@mui/material';

import { productQuery } from '@services/product';

import { Characteristic } from '@customTypes/preConfig';

import { useCreateReleaseContext } from '@modules/createRelease/context/useCreateRelease';
import ConfigsForm from './components/ConfigsForm';
import { useQuery } from './hooks/useQuery';
import CONFIG_PAGE from './consts';
import * as Styles from './styles';

const { TITLE, SUB_TITLE, DEFAULT_MESSAGE, ERROR_MESSAGE } = CONFIG_PAGE;

interface ConfigPageProps {
  isOpen: boolean;
  onClose: Function;
  repoName?: string;
  organizationId: string;
  productId: string;
  page: number;
  filteredCharacteristics: string[];
  title: string;
}

const ConfigPage = ({
  repoName = '',
  organizationId,
  productId,
  page,
  filteredCharacteristics,
  title
}: ConfigPageProps) => {
  const request = useQuery();
  const {
    setCurrentConfig,
    configPageData,
    changeThreshold,
    toggleChangeThreshold,
    allowChangeConfig,
    toggleAllowChangeConfig
  } = useCreateReleaseContext();
  const {
    characteristicCheckbox,
    setCharacteristicCheckbox,
    characteristicData,
    setSubcharacterCheckbox,
    subcharacterCheckbox,
    setMeasureCheckbox,
    measureCheckbox
  } = configPageData;

  const [data, setData] = useState(
    characteristicData.length
      ? characteristicData
      : request?.data.characteristics.filter((c: Characteristic) => filteredCharacteristics.includes(c.key))
  );

  const [isValuesValid, setIsValuesValid] = useState(false);
  const [error, setError] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    setIsValuesValid(false);
  }, [page]);

  useEffect(() => {
    setCurrentConfig(data);
  }, [data]);

  useEffect(() => { }, []);

  const clearRequest = (jsonValue: Characteristic[]): Characteristic[] => {
    const jsonString = JSON.stringify(jsonValue);
    const jsonStringReplaced = jsonString?.replace(/\d+/g, '0');
    return JSON?.parse(jsonStringReplaced) as Characteristic[];
  };

  const isArrayNull = (array: Array<any>) => array.length === 0;

  const isFormCompleted = () => {
    if (isArrayNull(characteristicCheckbox) && page === 0) return true;
    if (isArrayNull(subcharacterCheckbox) && page === 1) return true;
    if (isArrayNull(measureCheckbox) && page === 2) return true;
  };

  const sendJson = () => {
    const responseCharacterFiltered = data?.filter((charcterValue) =>
      characteristicCheckbox.includes(charcterValue.key)
    );
    const responseSubcharacterFiltered = responseCharacterFiltered?.map((charcterValue) => ({
      ...charcterValue,
      subcharacteristics: charcterValue.subcharacteristics.filter((subcharcterValue) =>
        subcharacterCheckbox.includes(subcharcterValue.key)
      )
    }));
    const finalData = responseSubcharacterFiltered?.map((charcterValue) => ({
      ...charcterValue,
      subcharacteristics: charcterValue.subcharacteristics.map((subcharcterValue) => ({
        ...subcharcterValue,
        measures: subcharcterValue.measures.filter((measureValue) => measureCheckbox.includes(measureValue.key))
      }))
    })) as Characteristic[];

    setShowAlert(true);
    productQuery
      .postPreConfig(organizationId, productId, { name: repoName, data: { characteristics: finalData } })
      .catch(() => {
        setError(true);
      });
  };

  const renderPage = () => {
    const genericProps = { onChange: setData, setIsValuesValid, data };
    const subtitle = 'Definir os pesos das';
    if (page === 0) {
      return (
        <ConfigsForm
          {...genericProps}
          subtitle={`${subtitle} caracteristicas`}
          type="characteristic"
          disable={!allowChangeConfig}
          checkboxValues={characteristicCheckbox}
          setCheckboxValues={setCharacteristicCheckbox}
        />
      );
    }
    if (page === 1) {
      return (
        <ConfigsForm
          {...genericProps}
          tabs={characteristicCheckbox}
          type="subcharacteristic"
          disable={!allowChangeConfig}
          subtitle={`${subtitle} subcaracteristicas`}
          checkboxValues={subcharacterCheckbox}
          setCheckboxValues={setSubcharacterCheckbox}
        />
      );
    }
    return (
      <Box display="flex" flexDirection="column">
        <ConfigsForm
          {...genericProps}
          tabs={subcharacterCheckbox}
          subtitle={`${subtitle} medidas`}
          type="measure"
          disable={!allowChangeConfig}
          checkboxValues={measureCheckbox}
          setCheckboxValues={setMeasureCheckbox}
        />
        <Typography color="#FF4646" marginTop="40px">
          <Checkbox
            checked={changeThreshold}
            onChange={toggleChangeThreshold}
            disabled={!allowChangeConfig}
            name="changeThresholdCheckbox"
          />
          Modificar valores de referência mínimo e máximo
        </Typography>
      </Box>
    );
  };

  return (
    <>
      <Styles.Header>
        <h1>{title}</h1>
      </Styles.Header>
      <Styles.Body>
        <p>{SUB_TITLE}</p>
        <p>
          <Switch checked={allowChangeConfig} onChange={toggleAllowChangeConfig} />
          Editar configurações
        </p>
      </Styles.Body>
      {renderPage()}
    </>
  );
};

export default ConfigPage;
