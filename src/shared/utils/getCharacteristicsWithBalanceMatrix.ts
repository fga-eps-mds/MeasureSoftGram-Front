import { CharacteristicWithBalanceMatrix } from "@customTypes/project";

const BALANCE_MATRIX = {
  functional_suitability: {
      '+': [
        'usability',
        'reliability',
        'maintainability',
      ],
      '-': [
        'performance_efficiency',
        'security',
      ]
  },
  performance_efficiency: {
      '+': [],
      '-': [
        'functional_suitability',
        'usability',
        'compatibility',
        'security',
        'maintainability',
        'portability',
      ]
  },
  usability: {
      '+': [
        'functional_suitability',
        'reliability',
      ],
      '-': [
        'performance_efficiency',
      ]
  },
  compatibility: {
      '+': [
        'portability'
      ],
      '-': [
        'security'
      ],
  },
  reliability: {
      '+': [
        'functional_suitability',
        'usability',
        'maintainability'
      ],
      '-': [],
  },
  security: {
      '+': [
        'reliability'
      ],
      '-': [
        'performance_efficiency',
        'usability',
        'compatibility'
      ]
  },
  maintainability: {
      '+': [
        'functional_suitability',
        'compatibility',
        'reliability',
        'portability',
      ],
      '-': [
        'performance_efficiency',
      ]
  },
  portability: {
      '+': [
        'compatibility',
        'maintainability',
      ],
      '-': [
        'performance_efficiency',
      ]
  },
}

const getCharacteristicsWithBalanceMatrix = (characteristics: string[]): CharacteristicWithBalanceMatrix[] =>  characteristics.reduce((acc, item, index) => [
    ...acc,
    {
      key: item,
      id: index,
      value: 50,
      correlations: BALANCE_MATRIX[item as keyof typeof BALANCE_MATRIX]
    }
  ], [])

export default getCharacteristicsWithBalanceMatrix;
