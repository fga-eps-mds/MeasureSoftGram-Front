import React, { useState, useCallback, useEffect } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { Characteristic, Measure, Subcharacteristic } from '@customTypes/preConfig';
import CheckboxButton from '@components/CheckboxButton/CheckboxButton';
import titleFormater from '@utils/titleFormater';
import toPercentage from '../../utils/toPercentage';
import PreConfigSliders from '../PreConfigSliders';
import PreConfigTabs from '../PreConfigTabs';
import { iterator, iteratorType } from '../../utils/iterators';
import { componentIterator } from '../../utils/componentIterator';

export const titleAndSubTitle = {
  title: 'Preencher pré configurações',
  subtitle: 'Mini explicação do que é caracteristica e como esse formulário pode demorar um tempo para ser preenchido'
};

interface PreConfigTypes {
  data: Characteristic[];
  type: iteratorType;
  onChange: Function;
  setCheckboxValues: Function;
  checkboxValues: string[];
  tabs?: string[];
}

const ConfigForm = ({ onChange, data, tabs, type, checkboxValues, setCheckboxValues }: PreConfigTypes) => {
  const [tabValue, setTabValue] = useState<string>('');
  const setWeight = (key: string) => (event: any) => {
    const weight = toPercentage(event.target.value);
    onChange(iterator[type]({ data, key, weight }));
  };

  useEffect(() => {
    if (tabs) setTabValue(tabs[0]);
  }, [tabs]);

  const checkboxValue = useCallback(
    (key: string) => {
      let namesArray = [...checkboxValues];

      if (checkboxValues.includes(key)) {
        namesArray = namesArray.filter((name) => name !== key);
      } else namesArray.push(key);

      setCheckboxValues(namesArray);
    },
    [checkboxValues, setCheckboxValues]
  );

  const checkBoxCallback = (
    value: Measure | Characteristic | Subcharacteristic,
    previousValue: Characteristic | Subcharacteristic
  ) => {
    if (previousValue?.key === tabValue || !previousValue)
      return (
        <Grid item>
          <CheckboxButton
            label={titleFormater(value.key)}
            checked={checkboxValues.includes(value.key)}
            style={{ marginRight: '8px' }}
            onClick={() => {
              checkboxValue(value.key);
            }}
          />
        </Grid>
      );
  };

  const renderCheckBoxes = () => (
    <Grid container marginBottom="64px" columns={4}>
      {componentIterator[type](data, checkBoxCallback)}
    </Grid>
  );

  const renderSliderCallback = (
    value: Measure | Characteristic | Subcharacteristic,
    previousValue: Characteristic | Subcharacteristic
  ) => {
    if (checkboxValues.includes(value.key) && (!previousValue || previousValue.key === tabValue)) {
      return <PreConfigSliders label={value.key} weight={value.weight} onChange={setWeight(value.key)} />;
    }
  };

  const renderSliders = () => <Box>{componentIterator[type](data, renderSliderCallback)}</Box>;

  const setTab = (_e: any, newValue: string) => {
    setTabValue(newValue);
  };

  const renderTabs = () => {
    if (tabs)
      return <PreConfigTabs style={{ marginBottom: '24px' }} onChange={setTab} value={tabValue} tabsValues={tabs} />;
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
