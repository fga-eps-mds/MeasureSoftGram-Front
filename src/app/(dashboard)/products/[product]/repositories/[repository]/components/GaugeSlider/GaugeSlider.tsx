import React, { useState } from "react";
import { Box, Slider } from "@mui/material";
import { useTranslation } from "react-i18next";

interface GaugeSliderProps {
  initialValues: number[];
  min: number;
  max: number;
  values: number[];
  setValues: (newValues: number[]) => void;
  step: number;
}

function GaugeSlider(props: GaugeSliderProps) {
  const {
    initialValues,
    min,
    max,
    values,
    setValues,
    step
  } = props;

  const { t } = useTranslation("header");

  const [perc, setPerc] = useState(
    initialValues.map((val: number) => (val / max) * 100)
  );

  const onChange = (e: Event, tValues: number | number[]) => {
    if (Array.isArray(tValues)) {
      const [minVal, maxVal] = tValues;
      // Os limites devem respeitar vermelho < amarelo e ficar dentro do
      // intervalo [min, max], inclusive nos extremos (vermelho em min,
      // amarelo em max).
      if (maxVal > minVal && minVal >= min && maxVal <= max) {
        setValues(tValues);
        setPerc(tValues.map((val: number) => (val / max) * 100));
      }
    }
  };

  const getAriaLabel = (index: number) =>
    index === 0 ? t("red_limit_label") : t("yellow_limit_label");

  return (
    <Box
      sx={{
        width: "100%",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Slider
        data-testid="gauge-slider-id"
        disableSwap
        getAriaLabel={getAriaLabel}
        getAriaValueText={(value, index) => `${getAriaLabel(index)}: ${value}`}
        sx={{
          width: '90%',
          "& .MuiSlider-track": {
            background: "#f1c40f",
            border: 0
          },
          "& .MuiSlider-thumb": {
            [`&:nth-of-type(${1}n)`]: {
              background: "#313131",
              "& span": {
                background: "#313131",
                borderRadius: '4px',
              }
            },
            [`&:nth-of-type(${2}n)`]: {
              background: "#313131",
              "& span": {
                background: "#313131",
                borderRadius: '4px',
              }
            }
          },
          "& .MuiSlider-mark": {
            width: '2px',
            height: '12px',
            borderRadius: '1px',
            background: "#ffffff",
            opacity: 0.9
          },
          "& .MuiSlider-rail": {
            opacity: 100,
            border: 0,
            background: `linear-gradient(to right, #e74c3c 0% ${perc[0]}%, #f1c40f ${perc[0]}% ${perc[1]}%, #07bc0c ${perc[1]}% 100%)`
          }
        }}
        valueLabelDisplay="auto"
        value={values}
        min={min}
        max={max}
        scale={(x) => (x)}
        marks={[
          { value: min, label: min },
          // Marca a posicao atual de cada limite (vermelho e amarelo) no
          // trilho, usando o proprio valor na escala [min, max].
          ...values.map((val: number) => ({ value: val, label: undefined })),
          { value: max, label: max }
        ]}
        onChange={onChange}
        step={step}
      />
    </Box>
  );
}

export default GaugeSlider;
