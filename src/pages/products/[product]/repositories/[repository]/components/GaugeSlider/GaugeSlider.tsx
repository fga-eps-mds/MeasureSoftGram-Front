import React, { useState } from "react";
import { Box, Slider } from "@mui/material";

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

  const [perc, setPerc] = useState(
    initialValues.map((val: number) => (val / max) * 100)
  );

  const onChange = (e: Event, tValues: number | number[]) => {
    if (Array.isArray(tValues)) {
      const [minVal, maxVal] = tValues;
      if (maxVal > minVal && maxVal !== minVal && minVal > 0 && maxVal < 1) {
        setValues(tValues);
        setPerc(tValues.map((val: number) => (val / max) * 100));
      }
    }
  };

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
            background: "none"
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
          ...perc.map((val: any) => ({
            value: val,
            label: val === 0 ? min : val === 1 ? max : undefined
          })),
          { value: max, label: max }
        ]}
        onChange={onChange}
        step={step}
      />
    </Box>
  );
}

export default GaugeSlider;
