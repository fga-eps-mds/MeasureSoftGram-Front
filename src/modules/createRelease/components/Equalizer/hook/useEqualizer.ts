/* eslint-disable camelcase */
import { useCallback, useState } from 'react';
import getCharacteristicsWithBalanceMatrix from '@utils/getCharacteristicsWithBalanceMatrix';
import { Changes, CharacteristicWithBalanceMatrix, ValuesCommitted } from '@customTypes/product';

export default function useEqualizer(selectedCharacteristics: string[]) {
  const characteristicWithBalanceMatrix = getCharacteristicsWithBalanceMatrix(selectedCharacteristics);
  const INITIAL_VALUES_COMMITTED = characteristicWithBalanceMatrix.reduce(
    (acc, item) => ({ ...acc, [item.key]: 50 }),
    {}
  );

  const [characteristics, setCharacteristics] = useState<CharacteristicWithBalanceMatrix[]>(
    characteristicWithBalanceMatrix
  );
  const [valuesCommitted, setValuesCommitted] = useState<ValuesCommitted>(INITIAL_VALUES_COMMITTED);
  const [changes, setChanges] = useState<Changes[]>([]);

  const addDeltaToChanges = useCallback(
    (characteristicName: string, newValue: number) => {
      const characteristic = characteristics.find((c) => c.key === characteristicName);
      const characteristicDragged = characteristic!.key as keyof typeof valuesCommitted;

      const value = valuesCommitted[characteristicDragged];

      const delta = newValue - value;

      setChanges((prevChanges) => [...prevChanges, { characteristic_key: characteristicDragged, delta }]);

      setValuesCommitted({
        ...characteristics.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {}),
        [characteristicDragged]: newValue
      });
    },
    [characteristics, valuesCommitted]
  );

  const equalize = useCallback(
    (characteristicName: string, val: number, allowDynamicBalance: boolean) => {
      const updatedCharacteristics = characteristics.map((item) => item);

      const characteristic = updatedCharacteristics.find((c) => c.key === characteristicName);
      const { correlations, value } = characteristic!;

      const delta = val - value;

      characteristic!.value = val;
      if (allowDynamicBalance) {
        setCharacteristics(updatedCharacteristics);
        return;
      }
      correlations['+'].forEach((characteristicKey) => {
        const correlatedCharacteristic = updatedCharacteristics.find((item) => item.key === characteristicKey);

        if (correlatedCharacteristic) {
          const newValue = correlatedCharacteristic!.value + delta;
          correlatedCharacteristic!.value = Math.max(0, Math.min(newValue, 100));
        }
      });

      correlations['-'].forEach((characteristicKey) => {
        const correlatedCharacteristic = updatedCharacteristics.find((item) => item.key === characteristicKey);

        if (correlatedCharacteristic) {
          const newValue = correlatedCharacteristic!.value - delta;
          correlatedCharacteristic!.value = Math.max(0, Math.min(newValue, 100));
        }
      });

      setCharacteristics(updatedCharacteristics);
    },
    [characteristics]
  );

  return {
    changes,
    characteristics,
    equalize,
    addDeltaToChanges
  };
}
