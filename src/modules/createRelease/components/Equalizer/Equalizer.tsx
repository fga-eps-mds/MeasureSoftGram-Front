import React, { useMemo } from 'react';
import EqualizerSingleSlider from '@modules/createRelease/components/EqualizerSingleSlider';
import { Box } from '@mui/material';
import { useCreateReleaseContext } from '@modules/createRelease/context/useCreateRelease';
import undelineRemover from '@utils/undelineRemover';
import useEqualizer from './hook/useEqualizer';

import * as Styles from './styles';

interface EquilizerProps {
  selectedCharacteristics: string[];
  allowDynamicBalance: boolean;
}

export default function Equalizer({ selectedCharacteristics, allowDynamicBalance }: EquilizerProps) {
  const { lastGoal, handleChangeForm } = useCreateReleaseContext();
  const { characteristics, equalize, addDeltaToChanges, changes, reset } = useEqualizer(selectedCharacteristics, lastGoal);

  const handleChangeCommitted = (characteristicName: string, newValue: number) => {
    addDeltaToChanges(characteristicName, newValue);
  };

  useMemo(() => {
    reset();
  }, [allowDynamicBalance]);

  useMemo(() => {
    handleChangeForm('changes', changes);
  }, [changes]);

  return (
    <Box justifyContent="space-around" display="flex">
      <Box gap="24px" display="flex">
        {selectedCharacteristics?.map((item, index) => {
          const char = characteristics.find((i) => i.key === item);
          let characteristicValue = 50 // Valor inicial do slider;

          if (char) {
            characteristicValue = char.value;
          }

          return (
            <EqualizerSingleSlider
              key={item}
              index={index + 1}
              name={undelineRemover(item)}
              value={characteristicValue}
              disabled={!selectedCharacteristics.includes(item)}
              onChange={(newValue) => equalize(item, newValue, allowDynamicBalance)}
              onChangeCommitted={(newValue) => handleChangeCommitted(item, newValue)}
            />
          );
        })}
      </Box>

      <Styles.Labels>
        {selectedCharacteristics?.map((item, index) => (
          <p key={item} data-testid="label">
            C{index + 1}: {undelineRemover(item)}
          </p>
        ))}
      </Styles.Labels>
    </Box>
  );
}
