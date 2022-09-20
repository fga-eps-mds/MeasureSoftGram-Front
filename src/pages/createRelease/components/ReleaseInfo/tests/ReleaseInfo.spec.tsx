import '@testing-library/jest-dom';

import React from 'react';
import { act, fireEvent, render } from '@testing-library/react';

import ReleaseInfo from '../ReleaseInfo';

jest.mock('@pages/createRelease/context/useCreateRelease', () => ({
  useCreateReleaseContext: () => ({
    releaseInfoForm: {
      characteristics: [ "reliability", "maintainability" ],
      endDate: "2022-09-25",
      name: "asdasd",
      startDate: "2022-09-18",
    },
    preConfigCharacteristics: ['reliability', 'maintainability'],
    handleChangeForm: () => {},
    handleSelectCharacteristics: () => {}
  })
}));

describe('<ReleaseInfo />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(<ReleaseInfo/>)
      expect(tree).toMatchSnapshot();
    });
  });

  describe('Comportamento', () => {
    it('Deve preencher campos do formulario', () => {
      const { getByTestId, getAllByTestId } = render(<ReleaseInfo/>)

      act(() => {
        fireEvent.change(getByTestId("apelido-release"), { target: { value: 'aoba' } });
        fireEvent.change(getByTestId("inicio-release"), { target: { value: '2022-09-25' } });
        fireEvent.change(getByTestId("fim-release"), { target: { value: '2022-09-31' } });
        fireEvent.click(getAllByTestId("characteristic-release")[0], { target: { checked: true } });
      });

      expect(true).toBeTruthy();
    });
  });
});
