import '@testing-library/jest-dom';

import React from 'react';
import { fireEvent, render, renderHook } from '@testing-library/react';

import { act } from 'react-dom/test-utils';
import ReleaseGoals from '../ReleaseGoals';
import useDynamicBalance from '../hook/useDynamicBalance';

jest.mock('@modules/createRelease/context/useCreateRelease', () => ({
  useCreateReleaseContext: () => ({
    releaseInfoForm: {
      characteristics: ['reliability', 'maintainability'],
      endDate: '2022-09-25',
      description: 'asdasd',
      name: 'asdasd',
      startDate: '2022-09-18'
    },
    handleChangeForm: jest.fn(),
    setAllowDynamicBalance: jest.fn(),
  })
}));

describe('<ReleaseGoals />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(<ReleaseGoals />);
      expect(tree).toMatchSnapshot();
    });
  });

  describe('Functions', () => {
    it('Deve chamar as funções de abrir/fechar corretamente', () => {
      const { result } = renderHook(() => useDynamicBalance());

      act(() => result.current.handleChange());
      expect(result.current.open).toBeTruthy();
      act(() => result.current.handleClose());
      expect(result.current.open).toBeFalsy();
      expect(result.current.allowDynamicBalance).toBeFalsy();
      act(() => {
        result.current.handleChange();
        result.current.handleConfirm();
      });
      expect(result.current.allowDynamicBalance).toBeTruthy();
      act(() => result.current.handleChange());
      expect(result.current.allowDynamicBalance).toBeFalsy();
    });
  });
});
