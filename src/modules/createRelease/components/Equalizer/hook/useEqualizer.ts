/* eslint-disable camelcase */
import { useCallback, useEffect, useState } from 'react';
import getCharacteristicsWithBalanceMatrix from '@utils/getCharacteristicsWithBalanceMatrix';
import { Changes, CharacteristicWithBalanceMatrix, ValuesCommitted } from '@customTypes/product';
import { balanceMatrixService } from '@services/balanceMatrix';

export default function useEqualizer(selectedCharacteristics: string[]) {
  const [characteristics, setCharacteristics] = useState<CharacteristicWithBalanceMatrix[]>([]);
  const [valuesCommitted, setValuesCommitted] = useState<ValuesCommitted>({});
  const [changes, setChanges] = useState<Changes[]>([]);

  const getBalanceMatrix = () => {
    balanceMatrixService.getBalanceMatrix().then((response) => {
      const { data } = response;

      const updatedCharacteristics = getCharacteristicsWithBalanceMatrix(selectedCharacteristics, data.result);
      const initialValuesCommited = updatedCharacteristics.reduce((acc, item) => ({ ...acc, [item.key]: 50 }), {});

      setCharacteristics(updatedCharacteristics);
      setValuesCommitted(initialValuesCommited);
    });
  };

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

  useEffect(() => {
    getBalanceMatrix();
  }, []);

  return {
    changes,
    characteristics,
    equalize,
    addDeltaToChanges,
    getBalanceMatrix
  };
}
