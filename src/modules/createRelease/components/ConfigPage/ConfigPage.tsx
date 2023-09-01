import React, { useEffect } from 'react';

import { Box, Checkbox, Switch, Typography } from '@mui/material';


import { useCreateReleaseContext } from '@modules/createRelease/context/useCreateRelease';
import ConfigsForm from '../ConfigsForm';
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
          subtitle={`${subtitle} características`}
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
          subtitle={`${subtitle} subcaracterísticas`}
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
            sx={{
              color: '#474747',
              '&.Mui-checked': {
                color: '#474747',
              },
            }}
          />
          Modificar valores de referência mínimo e máximo
        </Typography>
      </Box>
    );
  };

  return (
    <>
      <Styles.Header>
        <h1 style={{ color: '#33568E', fontWeight: '500' }}>{title}</h1>
      </Styles.Header>
      <Styles.Body>
        <p>{SUB_TITLE}</p>
        <Switch
          checked={allowChangeConfig}
          onChange={toggleAllowChangeConfig}
          color='default'
        />
        Editar configurações
      </Styles.Body>
      {renderPage()}
    </>
  );
};

export default ConfigPage;
