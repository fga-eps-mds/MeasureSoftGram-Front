import { renderHook, waitFor } from "@testing-library/react";
import useEqualizer from "../useEqualizer";

jest.mock("@services/balanceMatrix", () => ({
  balanceMatrixService: {
    getBalanceMatrix: () =>
      Promise.resolve({
        data: {
          result: {
            reliability: {
              "+": ["maintainability"],
              "-": [],
            },
            maintainability: {
              "+": ["reliability"],
              "-": ["performance_efficiency"],
            },
            performance_efficiency: {
              "+": [],
              "-": ["maintainability"],
            },
          },
        },
      }),
  },
}));

describe('useEqualizer', () => {
  it('deve carregar as características', async () => {
    const { result } = renderHook(() => useEqualizer(['reliability', 'maintainability', "performance_efficiency"]));
    await waitFor(() => {
      result.current.getBalanceMatrix()
      expect(result.current.characteristics).toEqual([
        {
          id: 0,
          key: 'reliability',
          value: 50,
          correlations: {
            '+': ['maintainability'],
            '-': []
          }
        },
        {
          id: 1,
          key: 'maintainability',
          value: 50,
          correlations: {
            '+': ['reliability'],
            '-': ['performance_efficiency']
          }
        },
        {
          id: 2,
          key: 'performance_efficiency',
          value: 50,
          correlations: {
            '+': [],
            '-': ['maintainability']
          }
        }
      ])
    })
  });

  it('deve chamar o addDeltaToChanges', async () => {
    const { result } = renderHook(() => useEqualizer(['reliability', 'maintainability']));
    await waitFor(() => {
      result.current.getBalanceMatrix()
      result.current.addDeltaToChanges('reliability', 80)
      expect(result.current.changes).toEqual([{ characteristic_key: 'reliability', delta: 30 }])
    })
  })

  it('deve chamar o equalize com e sem allowDynamicBalance', async () => {
    const { result } = renderHook(() => useEqualizer(['reliability', 'maintainability', 'performance_efficiency']))
    await waitFor(() => {
      result.current.getBalanceMatrix()
      result.current.equalize('maintainability', 80, true)
      expect(result.current.characteristics).toEqual([
        {
          id: 0,
          key: 'reliability',
          value: 50,
          correlations: {
            '+': ['maintainability'],
            '-': []
          }
        },
        {
          id: 1,
          key: 'maintainability',
          value: 80,
          correlations: {
            '+': ['reliability'],
            '-': ['performance_efficiency']
          }
        },
        {
          id: 2,
          key: 'performance_efficiency',
          value: 50,
          correlations: {
            '+': [],
            '-': ['maintainability']
          }
        }
      ])
    })

    await waitFor(() => {
      result.current.equalize('maintainability', 20, false)
      expect(result.current.characteristics).toEqual([
        {
          id: 0,
          key: 'reliability',
          value: 0,
          correlations: {
            '+': ['maintainability'],
            '-': []
          }
        },
        {
          id: 1,
          key: 'maintainability',
          value: 20,
          correlations: {
            '+': ['reliability'],
            '-': ['performance_efficiency']
          }
        },
        {
          id: 2,
          key: 'performance_efficiency',
          value: 100,
          correlations: {
            '+': [],
            '-': ['maintainability']
          }
        }
      ])
      result.current.equalize('maintainability', 50, false)
      expect(result.current.characteristics).toEqual([
        {
          id: 0,
          key: 'reliability',
          value: 30,
          correlations: {
            '+': ['maintainability'],
            '-': []
          }
        },
        {
          id: 1,
          key: 'maintainability',
          value: 50,
          correlations: {
            '+': ['reliability'],
            '-': ['performance_efficiency']
          }
        },
        {
          id: 2,
          key: 'performance_efficiency',
          value: 70,
          correlations: {
            '+': [],
            '-': ['maintainability']
          }
        }
      ])
    })
  });

  it('deve chamar o equalize sem correlações na array de características', async () => {
    const { result } = renderHook(() => useEqualizer(['maintainability']))
    await waitFor(() => {
      result.current.getBalanceMatrix()
      result.current.equalize('maintainability', 80, false)
      expect(result.current.characteristics).toEqual([
        {
          id: 0,
          key: 'maintainability',
          value: 80,
          correlations: {
            '+': ['reliability'],
            '-': ['performance_efficiency']
          }
        }
      ])
    })
  });
})
