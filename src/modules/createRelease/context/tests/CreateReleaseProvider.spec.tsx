import '@testing-library/jest-dom';

import React, { useEffect } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';

import { Product } from '@customTypes/product';
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
    getReleaseGoalList: () => ({ data: [{ id: 1, release_name: 'r1', start_at: '', end_at: '', changes: [] }] })
  }
}));

interface TestingComponentProps {
  step?: number
  configPage?: number
}

const TestingComponent = ({ step = 0, configPage = 0 }: TestingComponentProps) => {
  const {
    handleChangeForm,
    closeAlert,
    goToNextStep,
    finishReleasePlanning,
    setCurrentConfig,
    getPreviousStep,
    getNextStep,
    setUseLastConfig,
    toggleChangeThreshold
  } = useCreateReleaseContext();

  useEffect(() => {
    handleChangeForm('endDate', '30/08/2022')
    handleChangeForm('startDate', '30/08/2022')
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
        onClick={() => goToNextStep(0)}
      >Denifir pesos</button>
      <button
        type='submit'
        data-testid="finish-release-planning"
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
      fireEvent.click(tree.getByTestId('finish-release-planning'));
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
  });
});
