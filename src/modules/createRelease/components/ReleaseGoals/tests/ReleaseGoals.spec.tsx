import '@testing-library/jest-dom';

import React from 'react';
import { render } from '@testing-library/react';

import ReleaseGoals from '../ReleaseGoals';

jest.mock('@modules/createRelease/context/useCreateRelease', () => ({
  useCreateReleaseContext: () => ({
    releaseInfoForm: {
      characteristics: ['reliability', 'maintainability'],
      endDate: '2022-09-25',
      name: 'asdasd',
      startDate: '2022-09-18'
    }
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
});
