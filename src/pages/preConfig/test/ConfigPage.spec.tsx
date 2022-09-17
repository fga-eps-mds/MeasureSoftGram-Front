import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import ConfigPage from '../ConfigPage';

const REPO_NAME = 'REPO_TITLE';

describe('<ConfigPage />', () => {
  describe('Snapshot', () => {
    it('Deve corresponder ao Snapshot', () => {
      const tree = render(<ConfigPage isOpen onClose={jest.fn()} repoName={REPO_NAME} />);
      expect(tree).toMatchSnapshot();
    });
  });
});
