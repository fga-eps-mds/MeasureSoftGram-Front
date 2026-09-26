import getCharacteristicsWithBalanceMatrix from '@utils/getCharacteristicsWithBalanceMatrix';

const CHARACTERISTICS = ['reliability', 'maintanability'];
const MATRIX = {
  reliability: {
    '+': ['maintanability'],
    '-': []
  },
  maintanability: {
    '+': ['reliability'],
    '-': []
  }
};

const LAST_GOAL_DATA = {
  reliability: 80
};

describe('getCharacteristicsWithBalanceMatrix', () => {
  it('Deve retornar a matriz de características junto com a matriz de balanceamento', () => {
    const characteristicsWithBalanceMatrix = getCharacteristicsWithBalanceMatrix(
      CHARACTERISTICS,
      MATRIX,
      LAST_GOAL_DATA
    );

    expect(characteristicsWithBalanceMatrix).toEqual([
      {
        key: 'reliability',
        id: 0,
        value: 80,
        correlations: {
          '+': ['maintanability'],
          '-': []
        }
      },
      {
        key: 'maintanability',
        id: 1,
        value: 50,
        correlations: {
          '+': ['reliability'],
          '-': []
        }
      }
    ]);
  });

  it('Deve retornar a matriz de características junto com a matriz de balanceamento sem o lastGoalData', () => {
    const characteristicsWithBalanceMatrix = getCharacteristicsWithBalanceMatrix(CHARACTERISTICS, MATRIX);

    expect(characteristicsWithBalanceMatrix).toEqual([
      {
        key: 'reliability',
        id: 0,
        value: 50,
        correlations: {
          '+': ['maintanability'],
          '-': []
        }
      },
      {
        key: 'maintanability',
        id: 1,
        value: 50,
        correlations: {
          '+': ['reliability'],
          '-': []
        }
      }
    ]);
  });
});
