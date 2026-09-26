import { CharacteristicWithBalanceMatrix, Characteristics } from '@customTypes/product';

type BalanceMatrixRow = {
  '+': string[];
  '-': string[];
};

export type BalanceMatrix = {
  [key: string]: BalanceMatrixRow;
};

const getCharacteristicsWithBalanceMatrix = (
  characteristics: string[],
  balanceMatrix: BalanceMatrix,
  lastGoalCharacteristics?: Characteristics
): CharacteristicWithBalanceMatrix[] =>
  characteristics.reduce(
    (acc: CharacteristicWithBalanceMatrix[], item: string, index: number): CharacteristicWithBalanceMatrix[] => [
      ...acc,
      {
        key: item,
        id: index,
        value: lastGoalCharacteristics ? lastGoalCharacteristics[item as keyof Characteristics] ?? 50 : 50,
        correlations: balanceMatrix[item as keyof typeof balanceMatrix]
      }
    ],
    []
  );

export default getCharacteristicsWithBalanceMatrix;
