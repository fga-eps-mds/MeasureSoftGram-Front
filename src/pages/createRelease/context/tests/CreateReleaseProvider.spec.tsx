import '@testing-library/jest-dom';

import React, { useEffect } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';

import { CreateReleaseProvider, useCreateReleaseContext } from '../useCreateRelease';

jest.mock('@services/product', () => ({
  productQuery: {
    getProductCurrentPreConfig: () => ({data: {"id":25,"name":"3","data":{"characteristics":[{"key":"reliability","weight":50,"subcharacteristics":[{"key":"testing_status","weight":100,"measures":[{"key":"passed_tests","weight":33},{"key":"test_builds","weight":33},{"key":"test_coverage","weight":34}]}]},{"key":"maintainability","weight":50,"subcharacteristics":[{"key":"modifiability","weight":100,"measures":[{"key":"non_complex_file_density","weight":33},{"key":"commented_file_density","weight":33},{"key":"duplication_absense","weight":34}]}]}]},"created_at":"2022-09-15T18:56:57-03:00"}}),
    createProductReleaseGoal: () => ({})
  }
}));

const TestingComponent = () => {
  const {
    handleChangeForm,
    handleSelectCharacteristics,
    closeAlert,
    goToGoalsStep,
    createProductReleaseGoal
  } = useCreateReleaseContext();

  useEffect(() => {
    handleChangeForm('endDate', '30/08/2022')
    handleChangeForm('startDate', '30/08/2022')
    handleChangeForm('name', 'aoba')
    handleSelectCharacteristics('aoba')
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
        onClick={goToGoalsStep}
      >Denifir pesos</button>
      <button
        type='submit'
        data-testid="create-release-goal"
        onClick={createProductReleaseGoal}
      >Cria metas</button>
    </>
  );
};

describe('<CreateReleaseProvider />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe.skip('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(
        <CreateReleaseProvider
          organizationId='1'
          productId='3'
        >
          <TestingComponent/>
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
        >
          <TestingComponent/>
        </CreateReleaseProvider>
      )

      waitFor(() => {
        expect(tree.getAllByText('Aoba')).toBeInTheDocument()
      })

      fireEvent.click(tree.getByTestId('close-alert'));
      fireEvent.click(tree.getByTestId('goal-step'));
      fireEvent.click(tree.getByTestId('create-release-goal'));
    });
  });
});
