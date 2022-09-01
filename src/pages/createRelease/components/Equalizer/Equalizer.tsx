import React from 'react'
import EqualizerSingleSlider from '@pages/createRelease/components/EqualizerSingleSlider'
import { Box } from '@mui/material';
import { useCreateReleaseContext } from '@pages/createRelease/context/useCreateRelease';
import formatCharacteristicName from '@utils/formatCharacteristicName';
import useEqualizer from './hook/useEqualizer';

import * as Styles from './styles';

interface EquilizerProps {
  selectedCharacteristics: string[]
}

export default function Equalizer({ selectedCharacteristics }: EquilizerProps) {
  const {
    characteristics,
    equalize,
    addDeltaToChanges,
    changes
  } = useEqualizer(selectedCharacteristics)

  const { preConfigCharacteristics, handleChangeForm } = useCreateReleaseContext();

  const handleChangeCommitted = (index: number, newValue: number) => {
    addDeltaToChanges(index, newValue)
    handleChangeForm('changes', changes)
  }

  return (
    <Box justifyContent="space-around" display="flex">
      <Box gap="24px" display="flex">
        {preConfigCharacteristics?.map((item, index) => {
          const char = characteristics.find(i => i.key === item);

          let id = index;
          let value;

          if (char) {
            id = char.id
            value = char.value
          }

          return (
            <EqualizerSingleSlider
              key={id}
              index={index+1}
              name={formatCharacteristicName(item)}
              value={value || 50}
              disabled={!selectedCharacteristics.includes(item)}
              onChange={(newValue) => equalize(index, newValue)}
              onChangeCommitted={(newValue) => handleChangeCommitted(index, newValue)}
            />
          )
        })}
      </Box>

      <Styles.Labels>
        {preConfigCharacteristics?.map((item, index) => (
          <p key={item} data-testid="label">C{index+1}: {formatCharacteristicName(item)}</p>
        ))}
      </Styles.Labels>
    </Box>
  )
}
