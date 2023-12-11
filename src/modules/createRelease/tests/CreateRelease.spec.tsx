import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import CreateRelease from '../CreateRelease';

const product = {
  id: "1",
  name: "MeasureSoftGram",
  description: '',
  github_url: '',
  created_at: '',
  updated_at: '',
  gaugeRedLimit: 0,
  gaugeYellowLimit: 0
}

jest.mock('@modules/createRelease/context/useCreateRelease', () => ({
  ...jest.requireActual('@modules/createRelease/context/useCreateRelease'),
  useCreateReleaseContext: () => ({
    closeAlert: () => { },
    goToGoalsStep: () => { },
    resetStates: () => { },
    goToNextStep: () => true,
    finishReleasePlanning: () => { },
    releaseInfoForm: {
      characteristics: ['reliability', 'maintainability'],
      endDate: '2022-09-25',
      name: 'asdasd',
      description: 'asdasd',
      goal: 1,
      startDate: '2022-09-18'
    },
    alertMessage: 'successOnCreation',
    getNextStep: jest.fn((step: number) => step + 1),
    getPreviousStep: jest.fn((step: number) => step - 1),
    createProductReleaseGoal: () => { },
    configPageData: {
      characteristicData: [],
    }
  })
}));

describe('<CreateRelease />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(<CreateRelease open={true} handleClose={() => { }} productId="1" organizationId="1" currentProduct={product} />);

      expect(tree).toMatchSnapshot();
    });
  });

  it('Deve chamar o handleNextButton para todas as páginas', () => {
    const tree = render(<CreateRelease open={true} handleClose={() => { }} productId="1" organizationId="1" currentProduct={product} />);
    const { getByTestId } = tree;
    const nextButton = getByTestId('next-button');
    expect(nextButton).toBeDefined();
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    fireEvent.click(nextButton);
    const backButton = getByTestId('back-button');
    expect(backButton).toBeDefined();
    const cancelButton = getByTestId('cancel-button');
    expect(cancelButton).toBeDefined();
    fireEvent.click(cancelButton);
    fireEvent.click(backButton);
    fireEvent.click(backButton);
  });

  it('Deve fechar o modal e redefinir os estados ao clicar em Cancelar', () => {
    const handleClose = jest.fn();
    const { getByTestId } = render(
      <CreateRelease open handleClose={handleClose} productId="1" organizationId="1" currentProduct={product} />
    );

    fireEvent.click(getByTestId('cancel-button'));

    // Verifica se a função de fechamento foi chamada
    expect(handleClose).toHaveBeenCalled();
  });

});
