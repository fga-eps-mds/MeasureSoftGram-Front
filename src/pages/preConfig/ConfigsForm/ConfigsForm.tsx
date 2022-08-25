import React, { useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { Characteristic, Measure, Subcharacteristic } from '@customTypes/preConfig';
import CheckboxButton from '@components/CheckboxButton/CheckboxButton';
import titleFormater from '@utils/titleFormater';
import toPercentage from '../utils/toPercentage';
import PreConfigSliders from '../components/PreConfigSliders';
import PreConfigTabs from '../components/PreConfigTabs';
import { iterator, iteratorType } from '../utils/iterators';
import { componentIterator } from '../utils/componentIterator';

export const titleAndSubTitle = {
  title: 'Preencher pré configurações',
  subtitle: 'Mini explicação do que é caracteristica e como esse formulário pode demorar um tempo para ser preenchido'
};

interface PreConfigTypes {
  data: Characteristic[];
  type: iteratorType;
  onChange: Function;
  labels?: string[];
}

const ConfigForm = ({ onChange, data, labels, type }: PreConfigTypes) => {
  const labelArray = labels || [''];

  const [checkboxNames, setCheckboxNames] = useState<Array<string>>([]);
  const [tabValue, setTabValue] = useState<string>(labelArray[0]);

  const setWeight = (key: string) => (event: any) => {
    const weight = toPercentage(event.target.value);
    onChange(iterator[type]({ data, key, weight }));
  };

  const addCharacteristic = (key: string) => {
    let namesArray = [...checkboxNames];

    if (checkboxNames.includes(key)) {
      namesArray = namesArray.filter((name) => name !== key);
    } else namesArray.push(key);

    setCheckboxNames(namesArray);
  };

  const checkBoxCallback = (
    value: Measure | Characteristic | Subcharacteristic,
    previousValue: Characteristic | Subcharacteristic
  ) => {
    if (previousValue?.key === tabValue || !previousValue)
      return (
        <Grid item>
          <CheckboxButton
            label={titleFormater(value.key)}
            style={{ marginRight: '8px' }}
            onClick={() => {
              addCharacteristic(value.key);
            }}
          />
        </Grid>
      );
  };

  const renderCheckBoxes = () => (
    <Grid container marginBottom="64px">
      {componentIterator[type](data, checkBoxCallback)}
    </Grid>
  );

  const renderSliderCallback = (
    value: Measure | Characteristic | Subcharacteristic,
    previousValue: Characteristic | Subcharacteristic
  ) => {
    if (checkboxNames.includes(value.key) && (!previousValue || previousValue.key === tabValue)) {
      return <PreConfigSliders label={value.key} weight={value.weight} onChange={setWeight(value.key)} />;
    }
  };

  const renderSliders = () => <Box>{componentIterator[type](data, renderSliderCallback)}</Box>;

  const setTab = (_e: any, newValue: string) => {
    setTabValue(newValue);
  };

  const renderTabs = () => {
    if (labelArray.length > 1)
      return (
        <PreConfigTabs style={{ marginBottom: '24px' }} onChange={setTab} value={tabValue} tabsValues={labelArray} />
      );
  };

  return (
    <Box display="flex" flexDirection="column" mt="25vh">
      <Typography variant="h6" sx={{ marginBottom: '16px' }}>
        Preencher pré configurações
      </Typography>
      {renderTabs()}
      {renderCheckBoxes()}
      {renderSliders()}
    </Box>
  );
};

export default ConfigForm;
