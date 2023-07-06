import '@testing-library/jest-dom';

import React, { useEffect } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';

import { PreConfigEntitiesRelationship, Product, ReleaseGoal } from '@customTypes/product';
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

const TestingComponent = () => {
  const {
    handleChangeForm,
    handleSelectCharacteristics,
    closeAlert,
    goToNextStep,
    finishReleasePlanning,
    setCurrentConfig
  } = useCreateReleaseContext();

  useEffect(() => {
    handleChangeForm('endDate', '30/08/2022')
    handleChangeForm('startDate', '30/08/2022')
    handleChangeForm('name', 'aoba')
    handleSelectCharacteristics('aoba')
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
        expect(tree.getAllByText('Aoba')).toBeInTheDocument()
      })

      fireEvent.click(tree.getByTestId('close-alert'));
      fireEvent.click(tree.getByTestId('goal-step'));
      fireEvent.click(tree.getByTestId('finish-release-planning'));
    });
  });
});
