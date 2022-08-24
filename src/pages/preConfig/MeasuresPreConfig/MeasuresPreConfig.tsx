import React, { useState } from 'react';
import { Box, Grid, InputAdornment, Slider, TextField, Typography } from '@mui/material';
import CheckboxButton from '@components/CheckboxButton/CheckboxButton';
import titleFormater from '@utils/titleFormater';
import capitilizer from '@utils/capitilizer';
import mockedData from '../mockData.json';
import PreConfigTabs from '../components/PreConfigTabs/Tabs';
import toPercentage from '../utils/toPercentage';

export const titleAndSubTitle = {
  title: 'Preencher pré configurações',
  subtitle: 'Mini explicação do que é caracteristica e como esse formulário pode demorar um tempo para ser preenchido'
};

const CHARACTERISTICS = mockedData.data.characteristics;

const getLabel = () => {
  const labels: string[] = [];
  CHARACTERISTICS.forEach((x) =>
    x.subcharacteristics.forEach((y) => {
      labels.push(y.key);
    })
  );

  return labels;
};

const MeasuresPreConfig = () => {
  const [characteristics, setCharacteristics] = useState(CHARACTERISTICS);
  const [checkboxNames, setCheckboxNames] = useState<Array<string>>([]);
  const [tabValue, setTabValue] = useState(getLabel()[0]);

  const setWeight = (key: string) => (event: any) => {
    const value = toPercentage(event.target.value);

    const newObject = characteristics.map((characteristic) => ({
      ...characteristic,
      subcharacteristics: characteristic.subcharacteristics.map((subcharacteristic) => ({
        ...subcharacteristic,
        measures: subcharacteristic.measures.map((measure) =>
          measure.key === key ? { ...measure, weight: value as number } : measure
        )
      }))
    }));

    setCharacteristics(newObject);
  };

  const addCharacteristic = (key: string) => {
    let namesArray = [...checkboxNames];

    if (checkboxNames.includes(key)) {
      namesArray = namesArray.filter((name) => name !== key);
    } else namesArray.push(key);

    setCheckboxNames(namesArray);
  };

  const renderCheckboxes = () => (
    <Grid container marginBottom="64px" mt="24px" columns={3}>
      {CHARACTERISTICS.map((characteristic) =>
        characteristic.subcharacteristics.map((subcharacteristic) => {
          if (tabValue === subcharacteristic.key) {
            return subcharacteristic.measures.map((measure) => (
              <Grid item xs={1}>
                <CheckboxButton
                  label={titleFormater(measure.key)}
                  style={{ marginRight: '8px', marginBottom: '16px' }}
                  checked={checkboxNames.includes(measure.key)}
                  onClick={() => {
                    addCharacteristic(measure.key);
                  }}
                />
              </Grid>
            ));
          }
          return <div />;
        })
      )}
    </Grid>
  );

  const setTab = (_e: any, newValue: string) => {
    setTabValue(newValue);
  };

  const renderSliders = () =>
    characteristics.map((characteristic) =>
      characteristic.subcharacteristics.map((subcharacteristic) =>
        subcharacteristic.measures.map((measure) => {
          if (checkboxNames.includes(measure.key) && tabValue === subcharacteristic.key) {
            return (
              <Grid spacing={3} container columns={16}>
                <Grid item xs={3}>
                  <Typography textAlign="start">
                    <strong>{capitilizer(titleFormater(measure.key))}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={9}>
                  <Slider value={measure.weight} onChange={setWeight(measure.key)} />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    sx={{ width: '96px', top: -4 }}
                    variant="standard"
                    value={measure.weight}
                    onChange={setWeight(measure.key)}
                    InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                  />
                </Grid>
              </Grid>
            );
          }
          return <div />;
        })
      )
    );

  return (
    <Box display="flex" flexDirection="column" mt="25vh">
      <Typography variant="h6" sx={{ marginBottom: '16px' }}>
        Preencher pré configurações
      </Typography>
      <Box>
        <PreConfigTabs onChange={setTab} value={tabValue} tabsValues={getLabel()} />
        {renderCheckboxes()}
        {renderSliders()}
      </Box>
    </Box>
  );
};

export default MeasuresPreConfig;
