import { CharacteristicWithBalanceMatrix } from '@customTypes/product';

type BalanceMatrixRow = {
  '+': string[];
  '-': string[];
};

type BalanceMatrix = {
  [key: string]: BalanceMatrixRow;
};

const getCharacteristicsWithBalanceMatrix = (
  characteristics: string[],
  balanceMatrix: BalanceMatrix
): CharacteristicWithBalanceMatrix[] =>
  characteristics.reduce(
    (acc: CharacteristicWithBalanceMatrix[], item: string, index: number): CharacteristicWithBalanceMatrix[] => [
      ...acc,
      {
        key: item,
        id: index,
        value: 50,
        correlations: balanceMatrix[item as keyof typeof balanceMatrix]
      }
    ],
    []
  );

export default getCharacteristicsWithBalanceMatrix;
