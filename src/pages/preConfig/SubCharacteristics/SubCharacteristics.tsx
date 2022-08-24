import React, { useState } from 'react';
import { Box, Grid, Slider, Tab, Tabs, TextField, Typography } from '@mui/material';
import CheckboxButton from '@components/CheckboxButton/CheckboxButton';
import capitilizer from '@utils/capitilizer';
import mockedData from '../mockData.json';

export const titleAndSubTitle = {
  title: 'Preencher pré configurações',
  subtitle: 'Mini explicação do que é caracteristica e como esse formulário pode demorar um tempo para ser preenchido'
};

const CHARACTERISTICS = mockedData.data.characteristics;

const getLabel = () => CHARACTERISTICS.map((x) => x.key);

const titleFormater = (textValue: string) => textValue.replace(/_/g, ' ');

const SubCharacteristics = () => {
  const [Subcharacteristics, setSubCharacteristics] = useState(CHARACTERISTICS);
  const [checkboxNames, setCheckboxNames] = useState<Array<string>>([]);
  const [tabValue, setTabValue] = useState(getLabel()[0]);

  const setWeight = (key: string) => (event: any) => {
    const newValue = event.target.value;
    console.log(newValue);

    let value = Number.isNaN(newValue) || newValue < 0 ? 0 : newValue;
    if (newValue > 100) value = 100;

    const newObject = Subcharacteristics.map((characteristic) => ({
      ...characteristic,
      subcharacteristics: characteristic.subcharacteristics.map((subcharacteristic) =>
        subcharacteristic.key === key ? { ...subcharacteristic, weight: value as number } : subcharacteristic
      )
    }));

    setSubCharacteristics(newObject);
  };

  const addCharacteristic = (key: string) => {
    let namesArray = [...checkboxNames];

    if (checkboxNames.includes(key)) {
      namesArray = namesArray.filter((name) => name !== key);
    } else namesArray.push(key);

    setCheckboxNames(namesArray);
  };

  const renderCheckboxes = () => (
    <Grid container marginBottom="64px" mt="24px">
      {CHARACTERISTICS.map((characteristic) => {
        if (tabValue === characteristic.key)
          return characteristic.subcharacteristics.map((subcharacteristic) => (
            <Grid item>
              <CheckboxButton
                label={titleFormater(subcharacteristic.key)}
                style={{ marginRight: '8px' }}
                checked={checkboxNames.includes(subcharacteristic.key)}
                onClick={() => {
                  addCharacteristic(subcharacteristic.key);
                }}
              />
            </Grid>
          ));
        return <div />;
      })}
    </Grid>
  );

  const setTab = (_e: any, newValue: string) => {
    setTabValue(newValue);
  };

  const renderTabs = () => (
    <Tabs value={tabValue} onChange={setTab}>
      {getLabel().map((characteristic) => (
        <Tab value={characteristic} label={titleFormater(characteristic)} />
      ))}
    </Tabs>
  );

  const renderSliders = () =>
    Subcharacteristics.map((characteristic) =>
      characteristic.subcharacteristics.map((subcharacteristic) => {
        if (checkboxNames.includes(subcharacteristic.key) && tabValue === characteristic.key) {
          return (
            <Grid spacing={3} container columns={16}>
              <Grid item xs={3}>
                <Typography textAlign="start">
                  <strong>{capitilizer(titleFormater(subcharacteristic.key))}</strong>
                </Typography>
              </Grid>
              <Grid item xs={9}>
                <Slider value={subcharacteristic.weight} onChange={setWeight(subcharacteristic.key)} />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  sx={{ width: '96px', top: -4 }}
                  variant="standard"
                  value={subcharacteristic.weight}
                  onChange={setWeight(subcharacteristic.key)}
                />
              </Grid>
            </Grid>
          );
        }
        return <div />;
      })
    );

  return (
    <Box display="flex" flexDirection="column" mt="25vh">
      <Typography variant="h6" sx={{ marginBottom: '16px' }}>
        Preencher pré configurações
      </Typography>
      <Box>
        {renderTabs()}
        {renderCheckboxes()}
        {renderSliders()}
      </Box>
    </Box>
  );
};

export default SubCharacteristics;
