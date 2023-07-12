/* eslint-disable camelcase */
import { useCallback, useEffect, useState } from 'react';
import getCharacteristicsWithBalanceMatrix, { BalanceMatrix } from '@utils/getCharacteristicsWithBalanceMatrix';
import { Changes, CharacteristicWithBalanceMatrix, Goal, ValuesCommitted } from '@customTypes/product';
import { balanceMatrixService } from '@services/balanceMatrix';

export default function useEqualizer(selectedCharacteristics: string[], lastGoal?: Goal) {
  const [characteristics, setCharacteristics] = useState<CharacteristicWithBalanceMatrix[]>([]);
  const [valuesCommitted, setValuesCommitted] = useState<ValuesCommitted>({});
  const [balanceMatrix, setBalanceMatrix] = useState<BalanceMatrix>({});
  const [changes, setChanges] = useState<Changes[]>([]);

  const getBalanceMatrix = () => {
    balanceMatrixService.getBalanceMatrix().then((response) => {
      setBalanceMatrix(response.data.result);
    });
  };

  const updateCharacteristicsWithBalanceMatrix = () => {
    const updatedCharacteristics = getCharacteristicsWithBalanceMatrix(
      selectedCharacteristics,
      balanceMatrix,
      lastGoal?.data
    );
    const updatedValuesCommited = updatedCharacteristics.reduce((acc, item) => ({ ...acc, [item.key]: 50 }), {});

    setCharacteristics(updatedCharacteristics);
    setValuesCommitted(updatedValuesCommited);
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

  useEffect(() => {
    updateCharacteristicsWithBalanceMatrix();
  }, [balanceMatrix]);

  const reset = () => {
    updateCharacteristicsWithBalanceMatrix();
    setChanges([]);
  };

  return {
    changes,
    characteristics,
    equalize,
    addDeltaToChanges,
    getBalanceMatrix,
    reset
  };
}
