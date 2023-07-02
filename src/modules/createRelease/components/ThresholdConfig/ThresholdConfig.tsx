import React, { useState, useCallback } from 'react';
import { Box, Grid, Typography } from '@mui/material';

import { Characteristic, Measure, Subcharacteristic } from '@customTypes/preConfig';
import CheckboxButton from '@components/CheckboxButton/CheckboxButton';
import undelineRemover from '@utils/undelineRemover';

import { useCreateReleaseContext } from '@modules/createRelease/context/useCreateRelease';
import getThresholdInfo from '@modules/createRelease/utils/getThresholdInfo';
import { componentIterator } from '../../../preConfig/utils/componentIterator';

import PreConfigTabs from '../../../preConfig/components/PreConfigTabs';
import ThresholdSlider from '../ThresholdSlider/ThresholdSlider';

interface ThresholdConfigProrps {
  data: Characteristic[];
  onChange: Function;
  setCheckboxValues: Function;
  checkboxValues: string[];
  tabs: string[];
}

type limiterType = { tabName?: string; data: { key: string; weight: number } };

const ThresholdConfig = ({ onChange, data, checkboxValues, setCheckboxValues, tabs }: ThresholdConfigProrps) => {
  const [tabValue, setTabValue] = useState<string>(tabs[0]);
  const [limiters, setLimiters] = useState<limiterType[]>([]);
  const { setCurrentConfig } = useCreateReleaseContext();

  const keyGetter = (objectArray: limiterType[]) => objectArray.map((object) => object.data.key);

  const weightArrayHandler = (key: string, weight: number) => {
    const newLimiters = limiters;
    const index = keyGetter(limiters).indexOf(key);
    newLimiters[index].data.weight = weight;

    setLimiters(newLimiters);
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

  const onChangeTest = (min: number, max: number, key: string) => {
    const thresholdInfo = getThresholdInfo(key);

    const isOutOfRange = (thresholdInfo?.range[0] ?? 0) > min || (thresholdInfo?.range[1] ?? Infinity) < max;

    if (isOutOfRange || max < min) {
      return;
    }

    const mapMeasureValue = (measureValue: Measure) => {
      if (measureValue.key !== key) {
        return measureValue;
      }

      const { minFixed, maxFixed } = thresholdInfo ?? {};
      const newMin = minFixed ? measureValue.min : min;
      const newMax = maxFixed ? measureValue.max : max;

      return {
        ...measureValue,
        min: newMin,
        max: newMax
      };
    };

    const tempData = data.map((charValue) => ({
      ...charValue,
      subcharacteristics: charValue.subcharacteristics.map((subCharValue) => ({
        ...subCharValue,
        measures: subCharValue.measures.map(mapMeasureValue)
      }))
    }));
    console.log(tempData);

    setCurrentConfig(tempData);
  };

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
            style={{ marginRight: '8px' }}
            onClick={() => {
              if (!isChecked) {
                onChange();
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
    <Grid container marginBottom="64px" columns={4}>
      {componentIterator.measure(data, checkBoxCallback)}
    </Grid>
  );

  const renderSliderCallback = (value: Measure, previousValue: Subcharacteristic) => {
    // if user clicks on border of slider, the value to maxium possible

    if (checkboxValues.includes(value.key) && (!previousValue || previousValue.key === tabValue)) {
      const tabName = previousValue?.key;

      // if don't find the key in the limiters array, add it
      if (keyGetter(limiters).indexOf(value.key) === -1) {
        const sliderValue: limiterType = { tabName, data: { key: value.key, weight: value.weight } };
        const newLimiterValue: limiterType[] = [...limiters, sliderValue];
        setLimiters(newLimiterValue);
      }
      return (
        <ThresholdSlider
          key={value.key}
          label={value.key}
          weight={[value.min ?? 0, value.max ?? 100]}
          onChange={onChangeTest}
        />
      );
    }
  };

  const renderSliders = () => <Box>{componentIterator.measure(data, renderSliderCallback)}</Box>;

  const setTab = (_e: any, newValue: string) => {
    setTabValue(newValue);
  };

  const renderTabs = () => {
    if (tabs)
      return <PreConfigTabs style={{ marginBottom: '24px' }} onChange={setTab} value={tabValue} tabsValues={tabs} />;
  };

  return (
    <Box display="flex" flexDirection="column" maxWidth="600px">
      <Typography variant="h4" sx={{ marginBottom: '16px' }}>
        Definir os valores de referência mínimo e máximo
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: '16px' }}>
        Os valores de referência afetam como algumas medidas são calculadas. Aluns deles não podem ser modificados. Para
        mais detalhes veja a documentação disponível em Link
      </Typography>
      {renderTabs()}
      {renderCheckBoxes()}
      <Grid container columns={2}>
        <Grid item xs={1}>
          <Typography variant="body1" textAlign="start">
            Min
          </Typography>
        </Grid>
        <Grid item xs={1}>
          <Typography variant="body1" textAlign="end">
            Max
          </Typography>
        </Grid>
      </Grid>
      {renderSliders()}
    </Box>
  );
};

export default ThresholdConfig;
