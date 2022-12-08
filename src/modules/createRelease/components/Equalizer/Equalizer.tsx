import React from 'react';
import EqualizerSingleSlider from '@modules/createRelease/components/EqualizerSingleSlider';
import { Box } from '@mui/material';
import { useCreateReleaseContext } from '@modules/createRelease/context/useCreateRelease';
import undelineRemover from '@utils/undelineRemover';
import useEqualizer from './hook/useEqualizer';

import * as Styles from './styles';

interface EquilizerProps {
  selectedCharacteristics: string[];
}

export default function Equalizer({ selectedCharacteristics }: EquilizerProps) {
  const { characteristics, equalize, addDeltaToChanges, changes } = useEqualizer(selectedCharacteristics);

  const { preConfigCharacteristics, handleChangeForm } = useCreateReleaseContext();

  const handleChangeCommitted = (characteristicName: string, newValue: number) => {
    addDeltaToChanges(characteristicName, newValue);
    handleChangeForm('changes', changes);
  };

  return (
    <Box justifyContent="space-around" display="flex">
      <Box gap="24px" display="flex">
        {preConfigCharacteristics?.map((item, index) => {
          const char = characteristics.find((i) => i.key === item);

          let value;

          if (char) {
            value = char.value;
          }

          return (
            <EqualizerSingleSlider
              key={item}
              index={index + 1}
              name={undelineRemover(item)}
              value={value || 50}
              disabled={!selectedCharacteristics.includes(item)}
              onChange={(newValue) => equalize(item, newValue)}
              onChangeCommitted={(newValue) => handleChangeCommitted(item, newValue)}
            />
          );
        })}
      </Box>

      <Styles.Labels>
        {preConfigCharacteristics?.map((item, index) => (
          <p key={item} data-testid="label">
            C{index + 1}: {undelineRemover(item)}
          </p>
        ))}
      </Styles.Labels>
    </Box>
  );
}
