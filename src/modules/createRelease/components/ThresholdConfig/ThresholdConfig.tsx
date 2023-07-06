import React, { useState, useCallback } from 'react';
import { Box, Grid, Typography, Link } from '@mui/material';

import { Characteristic, Measure, Subcharacteristic } from '@customTypes/preConfig';
import CheckboxButton from '@components/CheckboxButton/CheckboxButton';
import undelineRemover from '@utils/undelineRemover';

import { useCreateReleaseContext } from '@modules/createRelease/context/useCreateRelease';
import getThresholdInfo from '@modules/createRelease/utils/getThresholdInfo';
import { componentIterator } from '../../utils/componentIterator';

import PreConfigTabs from '../PreConfigTabs';
import ThresholdSlider from '../ThresholdSlider';

interface ThresholdConfigProrps {
  data: Characteristic[];
  setCheckboxValues: Function;
  checkboxValues: string[];
  tabs: string[];
}

type limiterType = { tabName?: string; data: { key: string; weight: number } };

const ThresholdConfig = ({ data, checkboxValues, setCheckboxValues, tabs }: ThresholdConfigProrps) => {
  const [tabValue, setTabValue] = useState<string>(tabs[0]);
  const [limiters, setLimiters] = useState<limiterType[]>([]);
  const { setCurrentConfig } = useCreateReleaseContext();

  const keyGetter = (objectArray: limiterType[]) => objectArray.map((object) => object.data.key);

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

  const onChange = (min: number, max: number, key: string) => {
    const thresholdInfo = getThresholdInfo(key);

    const isOutOfRange = (thresholdInfo?.range[0] ?? 0) > min || (thresholdInfo?.range[1] ?? Infinity) < max;

    if (isOutOfRange || max < min) {
      return;
    }

    const mapMeasureValue = (measureValue: Measure): Measure => {
      if (measureValue.key !== key) {
        return measureValue;
      }

      const { minFixed, maxFixed } = thresholdInfo ?? {};
      const newMin = minFixed ? measureValue.min_threshold : min;
      const newMax = maxFixed ? measureValue.max_threshold : max;

      return {
        ...measureValue,
        min_threshold: newMin,
        max_threshold: newMax
      };
    };

    const tempData = data.map((charValue) => ({
      ...charValue,
      subcharacteristics: charValue.subcharacteristics.map((subCharValue) => ({
        ...subCharValue,
        measures: subCharValue.measures.map(mapMeasureValue)
      }))
    }));

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
            backgroundColor="#113d4c"
            colorHover="#113d4c"
            style={{ marginRight: '8px', marginBottom: '10px' }}
            onClick={() => {
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
      {componentIterator.measure(data, checkBoxCallback)}
    </Grid>
  );

  const renderSliderCallback = (value: Measure, previousValue: Subcharacteristic) => {
    if (checkboxValues.includes(value.key) && (!previousValue || previousValue.key === tabValue)) {
      const tabName = previousValue?.key;
      const thresholdInfo = getThresholdInfo(value.key);
      const minThreshold = value.min_threshold ?? thresholdInfo?.range[0] ?? 0
      const maxThreshold = value.max_threshold ?? thresholdInfo?.range[1] ?? 100

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
          min={minThreshold}
          max={maxThreshold}
          onChange={onChange}
        />
      );
    }
  };

  const renderSliders = () => <Box marginBottom="30px">{componentIterator.measure(data, renderSliderCallback)}</Box>;

  const setTab = (_e: any, newValue: string) => {
    setTabValue(newValue);
  };

  const renderTabs = () => {
    if (tabs)
      return <PreConfigTabs style={{ marginBottom: '24px' }} onChange={setTab} value={tabValue} tabsValues={tabs} />;
  };

  return (
    <Box display="flex" flexDirection="column" maxWidth="600px">
      <Typography variant="h4" sx={{ marginBottom: '16px', color: '#33568E', fontWeight: '500' }}>
        Definir os valores de referência mínimo e máximo
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: '16px' }}>
        Os valores de referência afetam como algumas medidas são calculadas. Aluns deles não podem ser modificados. Para
        mais detalhes veja a documentação disponível em{' '}
        <Link
          href="https://fga-eps-mds.github.io/2023-1-MeasureSoftGram-Doc/manual-de-uso/cli/#2311-thresholds"
          underline="hover"
          target="_blank"
        >
          (link)
        </Link>
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
