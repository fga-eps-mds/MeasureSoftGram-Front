import '@testing-library/jest-dom';

import React, { ReactNode, useEffect } from 'react';
import { act, fireEvent, render, renderHook, waitFor } from '@testing-library/react';

import { Product } from '@customTypes/product';
import { productQuery } from '@services/product';
import { CreateReleaseProvider, useCreateReleaseContext } from '../useCreateRelease';

jest.mock('@services/product', () => ({
  productQuery: {
    getProductCurrentPreConfig: () => ({ data: { "id": 25, "name": "3", "data": { "characteristics": [{ "key": "reliability", "weight": 50, "subcharacteristics": [{ "key": "testing_status", "weight": 100, "measures": [{ "key": "passed_tests", "weight": 33 }, { "key": "test_builds", "weight": 33 }, { "key": "test_coverage", "weight": 34 }] }] }, { "key": "maintainability", "weight": 50, "subcharacteristics": [{ "key": "modifiability", "weight": 100, "measures": [{ "key": "non_complex_file_density", "weight": 33 }, { "key": "commented_file_density", "weight": 33 }, { "key": "duplication_absense", "weight": 34 }] }] }] }, "created_at": "2022-09-15T18:56:57-03:00" } }),
    getPreConfigEntitiesRelationship: () => ({
      data: [{
        key: 'reliability',
        id: 1,
        name: 'Confiabilidade',
        description: '',
        subcharacteristics: []
      }]
    }),
    getReleaseGoalList: () => ({ data: [{ id: 1, release_name: 'r1', start_at: '', end_at: '', changes: [] }] }),
    getCurrentGoal: () => ({ data: { id: 1, release_name: 'r1', start_at: '', end_at: '', changes: [] } }),
    createProductReleaseGoal: () => ({ data: { id: 1 } })
  }
}));

interface TestingComponentProps {
  step?: number
  configPage?: number
  startDate?: string
  endDate?: string
}

interface Props {
  children: ReactNode;
}

const Provider = ({ children }: Props) => <CreateReleaseProvider organizationId='1' productId='3' currentProduct={product}>{children}</CreateReleaseProvider>;


const TestingComponent = ({ step = 0, configPage = 0, startDate = '30/08/2022', endDate = '30/08/2022' }: TestingComponentProps) => {
  const {
    handleChangeForm,
    closeAlert,
    goToNextStep,
    finishReleasePlanning,
    setCurrentConfig,
    getPreviousStep,
    getNextStep,
    setUseLastConfig,
    toggleChangeThreshold,
    configPageData,
  } = useCreateReleaseContext();

  useEffect(() => {
    handleChangeForm('endDate', endDate)
    handleChangeForm('startDate', startDate)
    handleChangeForm('name', 'aoba')
    setCurrentConfig([])
  }, [])

  return (
    <>
      <h1>Aoba</h1>
      <button
        type='submit'
        data-testid="close-alert"
        onClick={closeAlert}
      >Fechar alerta</button>
      <button
        type='submit'
        data-testid="goal-step"
        onClick={() => goToNextStep(step)}
      >Denifir pesos</button>
      <button
        type='submit'
        onClick={finishReleasePlanning}
      >Cria metas</button>
      <button
        type='submit'
        data-testid="test-previous-step"
        onClick={() => getPreviousStep(step, configPage)}
      >PreviousStep</button>
      <button
        type='submit'
        data-testid="test-next-step"
        onClick={() => getNextStep(step, configPage)}
      >NextStep</button>
      <button
        type='submit'
        data-testid="test-use-last-config"
        onClick={() => setUseLastConfig(true)}
      >UseLastConfig</button>
      <button
        type='submit'
        data-testid="test-change-threshold"
        onClick={toggleChangeThreshold}
      >ToggleChangeThreshold</button>
      <button
        type='submit'
        data-testid="test-set-characteristic-values-valid"
        onClick={() => configPageData.setCharacteristicValuesValid(false)}
      >SetIsValuesInvalid</button>
      <button
        type='submit'
        data-testid="test-set-invalid-date"
        onClick={() => {
          handleChangeForm('startDate', '30/08/2022')
          handleChangeForm('endDate', '29/08/2022')
          handleChangeForm('name', 'aoba')
        }}
      >SetInvalidDate</button>
    </>
  );
};

const product: Product = {
  id: "1",
  name: "MeasureSoftGram",
  description: '',
  github_url: '',
  created_at: '',
  updated_at: ''
}

const NextStepTestId = "test-next-step";
const PreviousStepTestId = "test-previous-step";

describe('<CreateReleaseProvider />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(
        <CreateReleaseProvider
          currentProduct={product}
          organizationId='1'
          productId='3'
        >
          <TestingComponent />
        </CreateReleaseProvider>
      )

      waitFor(() => {
        expect(tree.getAllByText('Aoba')).toBeInTheDocument()
      })

      expect(tree).toMatchSnapshot();
    });
  });

  describe('Comportamento', () => {
    it('Deve resetar estados', () => {
      const tree = render(
        <CreateReleaseProvider
          organizationId='1'
          productId='3'
          currentProduct={product}
        >
          <TestingComponent />
        </CreateReleaseProvider>
      )

      waitFor(() => {
        expect(tree.getAllByText('Aoba')).toBeDefined()
      })

      fireEvent.click(tree.getByTestId('close-alert'));
      fireEvent.click(tree.getByTestId('goal-step'));
    });

    describe('GetPreviousStep e GetNextStep', () => {
      it('Deve chamar getPreviousStep e GetNextStep corretamente para step 0', () => {
        const tree = render(
          <CreateReleaseProvider
            organizationId='1'
            productId='3'
            currentProduct={product}
          >
            <TestingComponent />
          </CreateReleaseProvider>
        )

        waitFor(() => {
          expect(tree.getAllByText('Aoba')).toBeDefined()
        })

        fireEvent.click(tree.getByTestId(PreviousStepTestId));
        fireEvent.click(tree.getByTestId(NextStepTestId));
      });
    })
    it('Deve chamar getPreviousStep e GetNextStep corretamente para step 2 e configPage 0', () => {
      const tree = render(
        <CreateReleaseProvider
          organizationId='1'
          productId='3'
          currentProduct={product}
        >
          <TestingComponent step={2} />
        </CreateReleaseProvider>
      )

      waitFor(() => {
        expect(tree.getAllByText('Aoba')).toBeDefined()
      })

      fireEvent.click(tree.getByTestId(PreviousStepTestId));
      fireEvent.click(tree.getByTestId(NextStepTestId));
    })
    it('Deve chamar getPreviousStep e GetNextStep corretamente para step 2 e configPage 1', () => {
      const tree = render(
        <CreateReleaseProvider
          organizationId='1'
          productId='3'
          currentProduct={product}
        >
          <TestingComponent step={2} configPage={1} />
        </CreateReleaseProvider>
      )

      waitFor(() => {
        expect(tree.getAllByText('Aoba')).toBeDefined()
      })

      fireEvent.click(tree.getByTestId(PreviousStepTestId));
      fireEvent.click(tree.getByTestId(NextStepTestId));
    });
    it('Deve chamar getPreviousStep e GetNextStep corretamente para step 2 e configPage 2', () => {
      const tree = render(
        <CreateReleaseProvider
          organizationId='1'
          productId='3'
          currentProduct={product}
        >
          <TestingComponent step={2} configPage={2} />
        </CreateReleaseProvider>
      )

      waitFor(() => {
        expect(tree.getAllByText('Aoba')).toBeDefined()
      })

      fireEvent.click(tree.getByTestId(PreviousStepTestId));
      fireEvent.click(tree.getByTestId(NextStepTestId));
    });
    it('Deve chamar o getPreviousStep corretamente para step 4 usando ultima config', () => {
      const tree = render(
        <CreateReleaseProvider
          organizationId='1'
          productId='3'
          currentProduct={product}
        >
          <TestingComponent step={4} />
        </CreateReleaseProvider>
      )

      waitFor(() => {
        expect(tree.getAllByText('Aoba')).toBeDefined()
      })

      fireEvent.click(tree.getByTestId('test-use-last-config'));
      fireEvent.click(tree.getByTestId(PreviousStepTestId));
    })
    it('Deve chamar o getPreviousStep corretamente para step 4 sem usar ultima config e mudando threshold', async () => {
      const tree = render(
        <CreateReleaseProvider
          organizationId='1'
          productId='3'
          currentProduct={product}
        >
          <TestingComponent step={4} />
        </CreateReleaseProvider>
      )

      waitFor(() => {
        expect(tree.getAllByText('Aoba')).toBeDefined()
      })

      fireEvent.click(tree.getByTestId('test-change-threshold'));
      fireEvent.click(tree.getByTestId(PreviousStepTestId));
    });
    it('Deve chamar o getPreviousStep corretamente para step 4 sem usar ultima config e sem mudar threshold', async () => {
      const tree = render(
        <CreateReleaseProvider
          organizationId='1'
          productId='3'
          currentProduct={product}
        >
          <TestingComponent step={4} />
        </CreateReleaseProvider>
      )

      waitFor(() => {
        expect(tree.getAllByText('Aoba')).toBeDefined()
      })

      fireEvent.click(tree.getByTestId(PreviousStepTestId));
    });

    it('Deve chamar o getNextStep corretamente para step 2 e configPage 2 usando threshold', async () => {
      const tree = render(
        <CreateReleaseProvider
          organizationId='1'
          productId='3'
          currentProduct={product}
        >
          <TestingComponent step={2} configPage={2} />
        </CreateReleaseProvider>
      )

      waitFor(() => {
        expect(tree.getAllByText('Aoba')).toBeDefined()
      })

      fireEvent.click(tree.getByTestId('test-change-threshold'));
      fireEvent.click(tree.getByTestId(NextStepTestId));
    })

    it('Deve chamar o goToNextStep para o step de característica com valores inválidos', async () => {
      const tree = render(
        <CreateReleaseProvider
          organizationId='1'
          productId='3'
          currentProduct={product}
        >
          <TestingComponent step={2} />
        </CreateReleaseProvider>
      )

      waitFor(() => {
        expect(tree.getAllByText('Aoba')).toBeDefined()
      })
      fireEvent.click(tree.getByTestId('test-change-threshold'));
      fireEvent.click(tree.getByTestId('goal-step'));
    })

    it('Deve chamar o finishReleasePlanning passando o mesmo releaseGoal', async () => {
      jest.spyOn(productQuery, 'getCurrentGoal').mockResolvedValueOnce({
        data: {
          id: 1,
          release_name: 'aoba',
          start_at: '2022-08-30',
          end_at: '2022-08-30'
        }
      })
      const tree = render(
        <CreateReleaseProvider
          organizationId='1'
          productId='3'
          currentProduct={product}
        >
          <TestingComponent />
        </CreateReleaseProvider>
      )

      waitFor(() => {
        expect(tree.getAllByText('Aoba')).toBeDefined()
      })

    })

    it('Deve chamar o finishReleasePlanning passando um novo releaseGoal', async () => {
      jest.spyOn(productQuery, 'createProductReleaseGoal').mockResolvedValueOnce({
        data: {
          id: 1
        }
      } as any)
      const tree = render(
        <CreateReleaseProvider
          organizationId='1'
          productId='3'
          currentProduct={product}
        >
          <TestingComponent />
        </CreateReleaseProvider>
      )

      waitFor(() => {
        expect(tree.getAllByText('Aoba')).toBeDefined()
      })

    })

    it('Deve chamar o goToNextStep com datas inválidas', async () => {
      const { result } = renderHook(() => useCreateReleaseContext(), { wrapper: Provider });

      act(() => {
        result.current.handleChangeForm('startDate', '2022-08-30')
        result.current.handleChangeForm('endDate', '2022-08-29')
        result.current.handleChangeForm('name', 'aoba')
      })

      act(() => {
        result.current.goToNextStep(0)
      })

      expect(result.current.alertMessage).toBe('invalidDate')
    });

    it('Deve setar isFirstRelease como true quando não tiver release', async () => {
      jest.spyOn(productQuery, 'getCurrentGoal').mockResolvedValueOnce({
        data: null
      } as any)

      const { result } = renderHook(() => useCreateReleaseContext(), { wrapper: Provider });

      await waitFor(() => {
        expect(result.current.isFirstRelease).toBeTruthy()
      })
    });


    it('Deve setar lastgoal corretamente quando tiver release', async () => {
      jest.spyOn(productQuery, 'getCurrentGoal').mockResolvedValueOnce({
        data: {
          id: 1,
          release_name: 'aoba',
          start_at: '2022-08-30',
          end_at: '2022-08-30'
        }
      } as any)

      const { result } = renderHook(() => useCreateReleaseContext(), { wrapper: Provider });

      await waitFor(() => {
        expect(result.current.lastGoal).toEqual({
          id: 1,
          release_name: 'aoba',
          start_at: '2022-08-30',
          end_at: '2022-08-30'
        })
      })
    });
  });
});
