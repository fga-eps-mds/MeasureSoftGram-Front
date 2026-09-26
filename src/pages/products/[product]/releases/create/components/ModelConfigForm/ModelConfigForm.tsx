import React from 'react';
import { Accordion, AccordionSummary, FormControlLabel, Switch, Typography } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Characteristic, PreConfigData } from '@customTypes/preConfig';
import SectionTooltip from '../SectionTooltip/SectionTooltip';
import CheckboxSliderInput from '../CheckboxSliderInput/CheckboxSliderInput';

interface ModelConfigFormProps {
  configPageData: PreConfigData;
  setConfigPageData: any;
  changeRefValue: boolean;
  setChangeRefValue: any;
}

export default function ModelConfigForm({ configPageData, setConfigPageData, changeRefValue, setChangeRefValue }: ModelConfigFormProps) {
  const { t } = useTranslation('plan_release');

  function calculateNewWeight(event: React.ChangeEvent<HTMLInputElement>, inputValue: number, currentWeightSum: number): number {
    const { type } = event.target;
    // eslint-disable-next-line no-nested-ternary
    let newWeight = type === 'checkbox' ? 0 : type === 'number' ? Number(event.target.value) : Number(inputValue);

    if (currentWeightSum + newWeight > 100) {
      newWeight = 100 - currentWeightSum;
    }

    return newWeight;
  }

  function updateConfigPageData(
    characteristicKey: string,
    updateFunc: (characteristic: Characteristic) => Characteristic
  ) {
    setConfigPageData((prevData: { characteristics: Characteristic[] }) => ({
      ...prevData,
      characteristics: prevData.characteristics.map((characteristic: Characteristic) =>
        characteristic.key === characteristicKey ? updateFunc(characteristic) : characteristic
      ),
    }));
  }

  function handleCharacteristicChange(event: React.ChangeEvent<HTMLInputElement>, inputValue: number, characteristicKey: string) {
    const { checked, type } = event.target;

    const currentWeightSum = configPageData.characteristics.reduce((sum, characteristic) =>
      characteristic.key !== characteristicKey ? sum + characteristic.weight : sum
      , 0);

    const newWeight = calculateNewWeight(event, inputValue, currentWeightSum);

    updateConfigPageData(characteristicKey, (characteristic) => ({
      ...characteristic,
      weight: newWeight,
      active: type === 'checkbox' ? checked : characteristic.active,
    }));
  }

  function handleSubcharacteristicChange(event: React.ChangeEvent<HTMLInputElement>, inputValue: number,
    characteristicKey: string, subcharacteristicKey: string) {
    const { checked, type } = event.target;

    const alteredCharacteristic = configPageData.characteristics.find(c => c.key === characteristicKey);
    const currentWeightSum = alteredCharacteristic?.subcharacteristics.reduce((sum, subcharacteristic) =>
      subcharacteristic.key !== subcharacteristicKey ? sum + subcharacteristic.weight : sum
      , 0) || 0;

    const newWeight = calculateNewWeight(event, inputValue, currentWeightSum);

    updateConfigPageData(characteristicKey, (characteristic) => ({
      ...characteristic,
      subcharacteristics: characteristic.subcharacteristics.map((subcharacteristic) =>
        subcharacteristic.key === subcharacteristicKey
          ? {
            ...subcharacteristic,
            weight: newWeight,
            active: type === 'checkbox' ? checked : subcharacteristic.active,
          }
          : subcharacteristic
      ),
    }));
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  function handleMeasureChange(event: React.ChangeEvent<HTMLInputElement>, inputValue: number,
    characteristicKey: string, subcharacteristicKey: string, measureKey: string) {
    const { checked, type } = event.target;

    const alteredCharacteristic = configPageData.characteristics.find(c => c.key === characteristicKey);
    const alteredSubcharacteristic = alteredCharacteristic?.subcharacteristics.find(s => s.key === subcharacteristicKey);
    const currentWeightSum = alteredSubcharacteristic?.measures.reduce((sum, measure) =>
      measure.key !== measureKey ? sum + measure.weight : sum
      , 0) || 0;

    const newWeight = calculateNewWeight(event, inputValue, currentWeightSum);

    updateConfigPageData(characteristicKey, (characteristic) => ({
      ...characteristic,
      subcharacteristics: characteristic.subcharacteristics.map((subcharacteristic) =>
        subcharacteristic.key === subcharacteristicKey
          ? {
            ...subcharacteristic,
            measures: subcharacteristic.measures.map((measure) =>
              measure.key === measureKey
                ? {
                  ...measure,
                  weight: newWeight,
                  active: type === 'checkbox' ? checked : measure.active,
                }
                : measure
            ),
          }
          : subcharacteristic
      ),
    }));
  }

  return (
    <>
      <SectionTooltip id='characteristicSection' text={t('defineCharacteristics')} tooltip={t('defineCharacteristicsTooltip')} />
      <Accordion
        key="CarAccordion"
        square
        sx={{
          boxShadow: 'inherit',
          border: 0.5,
          backgroundColor: "transparent",
          borderColor: "#00000040",
          borderRadius: 3,
          marginTop: 2
        }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>{t('characteristic')}</Typography>
        </AccordionSummary>
        {
          configPageData?.characteristics?.map((characteristic) => (
            <CheckboxSliderInput
              key={`characteristic-${characteristic.key}`}
              label={t(`characteristics.${characteristic.key}`)}
              labelKey={characteristic.key}
              inputValue={characteristic.weight}
              // eslint-disable-next-line react/jsx-no-bind
              setInputValue={handleCharacteristicChange}
              checkboxValue={characteristic.active}
            />
          ))
        }
      </Accordion>

      <SectionTooltip id='subcharacteristicSection' text={t('defineSubCharacteristics')} tooltip={t('defineSubCharacteristicsTooltip')} />
      <Accordion
        key="SubAccordion"
        square
        sx={{
          boxShadow: 'inherit',
          border: 0.5,
          backgroundColor: "transparent",
          borderColor: "#00000040",
          borderRadius: 3,
          marginTop: 2
        }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>{t('subCharacteristic')}</Typography>
        </AccordionSummary>
        {
          configPageData?.characteristics?.filter(characteristic => characteristic.active === true)
            .map((characteristic) => (
              <Accordion
                id={`SubCarAccordion-${characteristic.key}`}
                key={`SubCarAccordion-${characteristic.key}`}
                square
                sx={{
                  boxShadow: 'inherit',
                  border: 0.5,
                  backgroundColor: "transparent",
                  borderColor: "#00000040",
                  borderRadius: 3,
                  // eslint-disable-next-line sonarjs/no-duplicate-string
                  margin: '0 1rem 1rem !important'
                }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>{t(`characteristics.${characteristic.key}`)}</Typography>
                </AccordionSummary>
                {
                  characteristic.subcharacteristics?.map((subcharacteristic) => (
                    <CheckboxSliderInput
                      key={`subcharacteristics-${characteristic.key}-${subcharacteristic.key}`}
                      label={t(`subCharacteristics.${subcharacteristic.key}`)}
                      labelKey={subcharacteristic.key}
                      secLabel={characteristic.key}
                      inputValue={subcharacteristic.weight}
                      // eslint-disable-next-line react/jsx-no-bind
                      setInputValue={handleSubcharacteristicChange}
                      checkboxValue={subcharacteristic.active}
                    />
                  ))
                }
              </Accordion>
            ))
        }
      </Accordion>

      <SectionTooltip id='medidasSection' text={t("defineMeasures")} tooltip={t("defineMeasuresTooltip")} />
      <FormControlLabel
        sx={{
          marginLeft: 0
        }}
        control={<Switch
          checked={changeRefValue}
          onChange={() => setChangeRefValue(!changeRefValue)}
          color="primary" />}
        label={t("changeRefValues")}
        labelPlacement="start"
      />
      <Accordion
        key="MedidasAccordion"
        square
        sx={{
          boxShadow: 'inherit',
          border: 0.5,
          backgroundColor: "transparent",
          borderColor: "#00000040",
          borderRadius: 3,
          marginTop: 2
        }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>{t("measure")}</Typography>
        </AccordionSummary>
        {
          configPageData?.characteristics?.filter(characteristic => characteristic.active === true)
            .map((characteristic) => (
              <Accordion
                key={`SubCarAccordion-${characteristic.key}`}
                square
                sx={{
                  boxShadow: 'inherit',
                  border: 0.5,
                  backgroundColor: "transparent",
                  borderColor: "#00000040",
                  borderRadius: 3,
                  margin: '0 1rem 1rem !important'
                }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography>{t(`characteristics.${characteristic.key}`)}</Typography>
                </AccordionSummary>
                {
                  characteristic.subcharacteristics?.filter(subcharacteristics => subcharacteristics.active === true)
                    .map((subcharacteristic) => (
                      <Accordion
                        id={`MetricSubCarAccordion-${subcharacteristic.key}`}
                        key={`MetricSubCarAccordion-${subcharacteristic.key}`}
                        square
                        sx={{
                          boxShadow: 'inherit',
                          border: 0.5,
                          backgroundColor: "transparent",
                          borderColor: "#00000040",
                          borderRadius: 3,
                          margin: '0 1rem 1rem !important'
                        }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography>{t(`subCharacteristics.${subcharacteristic.key}`)}</Typography>
                        </AccordionSummary>
                        {
                          subcharacteristic.measures?.map((measure) => (
                            <CheckboxSliderInput
                              key={`metric-${measure.key}-${subcharacteristic.key}-${characteristic.key}`}
                              label={t(`measures.${measure.key}`)}
                              labelKey={measure.key}
                              secLabel={subcharacteristic.key}
                              terLabel={characteristic.key}
                              inputValue={measure.weight}
                              // eslint-disable-next-line react/jsx-no-bind
                              setInputValue={handleMeasureChange}
                              checkboxValue={measure.active}
                            />
                          ))
                        }
                      </Accordion>
                    ))
                }
              </Accordion>
            ))
        }
      </Accordion>
    </>
  );
}
