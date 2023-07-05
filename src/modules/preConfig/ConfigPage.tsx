import React, { useEffect } from 'react';

import { Box, Checkbox, Switch, Typography } from '@mui/material';

import { productQuery } from '@services/product';

import { Characteristic } from '@customTypes/preConfig';

import { useCreateReleaseContext } from '@modules/createRelease/context/useCreateRelease';
import ConfigsForm from './components/ConfigsForm';
import CONFIG_PAGE from './consts';
import * as Styles from './styles';

const { SUB_TITLE } = CONFIG_PAGE;

interface ConfigPageProps {
  page: number;
  title: string;
}

const ConfigPage = ({
  page,
  title,
}: ConfigPageProps) => {
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
    measureCheckbox,
    setCharacteristicValuesValid
  } = configPageData;

  useEffect(() => {
    setCharacteristicValuesValid(false);
  }, [page]);

  const renderPage = () => {
    const genericProps = { onChange: setCurrentConfig, setIsValuesValid: setCharacteristicValuesValid, data: characteristicData };
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
