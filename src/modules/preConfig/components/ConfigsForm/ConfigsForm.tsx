import React, { useState, useCallback, useEffect } from 'react';
import { Box, Grid, Typography } from '@mui/material';

import { Characteristic, Measure, Subcharacteristic } from '@customTypes/preConfig';
import CheckboxButton from '@components/CheckboxButton/CheckboxButton';
import undelineRemover from '@utils/undelineRemover';

import { componentIterator } from '../../utils/componentIterator';
import { iterator, iteratorType } from '../../utils/iterators';
import toPercentage from '../../utils/toPercentage';

import PreConfigSliders from '../PreConfigSliders';
import PreConfigTabs from '../PreConfigTabs';

interface PreConfigTypes {
  data: Characteristic[];
  type: iteratorType;
  disable: boolean;
  onChange: Function;
  subtitle: string;
  setCheckboxValues: Function;
  setIsValuesValid: Function;
  checkboxValues: string[];
  tabs?: string[];
}

type limiterType = { tabName?: string; data: { key: string; weight: number } };
const PERCENTAGE = 100;

const ConfigForm = ({
  onChange,
  data,
  type,
  disable,
  checkboxValues,
  setCheckboxValues,
  setIsValuesValid,
  subtitle,
  tabs
}: PreConfigTypes) => {
  const [tabValue, setTabValue] = useState<string>('');
  const [limiters, setLimiters] = useState<limiterType[]>([]);

  useEffect(() => {
    let newLimiters: limiterType[] = []

    componentIterator[type](data, (
      value: Measure | Characteristic | Subcharacteristic,
      previousValue?: Characteristic | Subcharacteristic) => {

      if (checkboxValues.includes(value.key)) {
        const tabName = previousValue?.key;
        if (keyGetter(newLimiters).indexOf(value.key) === -1) {
          const sliderValue: limiterType = { tabName, data: { key: value.key, weight: value.weight } };
          newLimiters = [...newLimiters, sliderValue];
        }
      }
    })

    setLimiters(newLimiters)
  }, [type, checkboxValues]);

  useEffect(() => {
    if (tabs) setTabValue(tabs[0]);
  }, [tabs]);

  useEffect(() => {
    let totalValue = 0;

    limiters.forEach((limiter) => {
      totalValue += limiter.data.weight;
    });

    const quantityTabs = tabs ? tabs.length : 1;
    const minimalValueToFinish = PERCENTAGE * quantityTabs;

    setIsValuesValid(minimalValueToFinish === totalValue);
  }, [limiters, checkboxValues, tabs, setIsValuesValid, data]);

  const keyGetter = (objectArray: limiterType[]) => objectArray.map((object) => object.data.key);

  const weightArrayHandler = (key: string, weight: number) => {
    const newLimiters = limiters;
    const index = keyGetter(limiters).indexOf(key);
    newLimiters[index].data.weight = weight;

    setLimiters(newLimiters);
  };

  const setWeight = (key: string, tabName?: string) => (event: any) => {
    const currentWeight = toPercentage(event.target.value);

    let weightSumExeceptCurrent = 0;

    limiters.forEach((limiter) => {
      if (limiter.tabName === tabName && limiter.data.key !== key) weightSumExeceptCurrent += limiter.data.weight;
    });

    const limit = PERCENTAGE - weightSumExeceptCurrent;

    if (currentWeight <= limit) {
      onChange(iterator[type]({ data, key, weight: currentWeight }));
      weightArrayHandler(key, currentWeight);
    }
  };

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
    if (previousValue?.key === tabValue || !previousValue) {
      const isChecked = checkboxValues.includes(value.key);
      return (
        <Grid item key={value.key}>
          <CheckboxButton
            label={undelineRemover(value.key)}
            checked={isChecked}
            backgroundColor="#113d4c"
            colorHover="#113d4c"
            disabled={disable}
            style={{ marginRight: '8px' }}
            onClick={() => {
              if (!isChecked) {
                onChange(iterator[type]({ data, key: value.key, weight: 0 }));
              }
              checkboxValue(value.key);
              const index = keyGetter(limiters).indexOf(value.key);
              if (!(index < 0)) {
                limiters.splice(index, 1);
                const newLimiterValue = limiters;
                setLimiters(newLimiterValue);
              }
            }}
          />
        </Grid>
      );
    }
  };

  const renderCheckBoxes = () => (
    <Grid container marginBottom="15px" columns={4}>
      {componentIterator[type](data, checkBoxCallback)}
    </Grid>
  );

  const renderSliderCallback = (
    value: Measure | Characteristic | Subcharacteristic,
    previousValue: Characteristic | Subcharacteristic
  ) => {
    // if user clicks on border of slider, the value to maxium possible

    if (checkboxValues.includes(value.key) && (!previousValue || previousValue.key === tabValue)) {
      const tabName = previousValue?.key;
      return (
        <PreConfigSliders
          key={value.key}
          label={value.key}
          weight={value.weight}
          disable={disable}
          onChange={setWeight(value.key, tabName)}
        />
      );
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
    <Box display="flex" flexDirection="column" mt="5vh">
      <Typography variant="h6" sx={{ marginBottom: '16px' }}>
        {subtitle}
      </Typography>
      {renderTabs()}
      {renderCheckBoxes()}
      {renderSliders()}
    </Box>
  );
};

export default ConfigForm;
