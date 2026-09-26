import React, { } from 'react';
import { Accordion, AccordionSummary, Typography } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Characteristic, Measure, PreConfigData, Subcharacteristic } from '@customTypes/preConfig';
import thresholdInfo from '@utils/getThresholdInfo';
import MinMaxInput from '../MinMaxInput/MinMaxInput';
import SectionTooltip from '../SectionTooltip/SectionTooltip';


interface ReferenceValuesFormProps {
  configPageData: PreConfigData;
  defaultPageData: PreConfigData;
  setConfigPageData: any;
}

export default function ReferenceValuesForm({ configPageData, defaultPageData, setConfigPageData }: ReferenceValuesFormProps) {
  const { t } = useTranslation('plan_release');
  const thresholdData = thresholdInfo;

  function updateMeasureThreshold(
    measure: Measure,
    newValue: number,
    threshold: string
  ): Measure {
    return {
      ...measure,
      min_threshold: threshold === "min" ? newValue : measure.min_threshold,
      max_threshold: threshold === "max" ? newValue : measure.max_threshold,
    };
  }

  function updateSubcharacteristicMeasures(
    subcharacteristic: Subcharacteristic,
    measureKey: string,
    newValue: number,
    threshold: string
  ): Subcharacteristic {
    return {
      ...subcharacteristic,
      measures: subcharacteristic.measures.map((measure) =>
        measure.key === measureKey
          ? updateMeasureThreshold(measure, newValue, threshold)
          : measure
      ),
    };
  }

  function updateCharacteristicSubcharacteristics(
    characteristic: Characteristic,
    subcharacteristicKey: string,
    measureKey: string,
    newValue: number,
    threshold: string
  ): Characteristic {
    return {
      ...characteristic,
      subcharacteristics: characteristic.subcharacteristics.map((subcharacteristic) =>
        subcharacteristic.key === subcharacteristicKey
          ? updateSubcharacteristicMeasures(subcharacteristic, measureKey, newValue, threshold)
          : subcharacteristic
      ),
    };
  }

  function handleMeasureChange(
    event: React.ChangeEvent<HTMLInputElement>,
    characteristicKey: string,
    subcharacteristicKey: string,
    measureKey: string,
    threshold: string
  ) {
    const newValue = Number(event.target.value);

    setConfigPageData((prevData: { characteristics: any[] }) => ({
      ...prevData,
      characteristics: prevData.characteristics.map((characteristic: Characteristic) =>
        characteristic.key === characteristicKey
          ? updateCharacteristicSubcharacteristics(characteristic, subcharacteristicKey, measureKey, newValue, threshold)
          : characteristic
      ),
    }));
  }

  return (
    <>
      <SectionTooltip text={t("defineRefValues")} tooltip={t("defineRefValuesTooltip")} />
      <Accordion
        defaultExpanded
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
          <Typography>{t("refValues")}</Typography>
        </AccordionSummary>
        {
          configPageData?.characteristics?.filter(characteristics => characteristics.active === true).map((characteristic) => (
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
                characteristic.subcharacteristics?.filter(subcharacteristics => subcharacteristics.active === true).map((subcharacteristic) => (
                  <Accordion
                    key={`MetricSubCarAccordion-${characteristic.key}-${subcharacteristic.key}`}
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
                      subcharacteristic.measures?.filter(measures => measures.active === true).map((measure) => (
                        <MinMaxInput
                          key={`metric-${measure.key}-${subcharacteristic.key}-${characteristic.key}`}
                          label={t(`measures.${measure.key}`)}
                          minInputValue={measure.min_threshold}
                          maxInputValue={measure.max_threshold}
                          setMinInputValue={(event: React.ChangeEvent<HTMLInputElement>) =>
                            handleMeasureChange(event, characteristic.key, subcharacteristic.key, measure.key, "min")}
                          setMaxInputValue={(event: React.ChangeEvent<HTMLInputElement>) =>
                            handleMeasureChange(event, characteristic.key, subcharacteristic.key, measure.key, "max")}
                          minThreshold={defaultPageData.characteristics
                            .find(c => c.key === characteristic.key)
                            ?.subcharacteristics
                            .find(sc => sc.key === subcharacteristic.key)
                            ?.measures
                            .find(m => m.key === measure.key)
                            ?.min_threshold!}
                          maxThreshold={defaultPageData.characteristics
                            .find(c => c.key === characteristic.key)
                            ?.subcharacteristics
                            .find(sc => sc.key === subcharacteristic.key)
                            ?.measures
                            .find(m => m.key === measure.key)
                            ?.max_threshold!}
                          minFixed={thresholdData.find(m => m.key === measure.key)?.minFixed}
                          maxFixed={thresholdData.find(m => m.key === measure.key)?.maxFixed}
                          tooltip={t(`measures-desc.${measure.key}`)}
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
