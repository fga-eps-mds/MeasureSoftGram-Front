import React from 'react';
import { render } from '@testing-library/react';
import FirstReleaseWarning from '../FirstReleaseWarning';

describe('<FirstReleaseWarning />', () => {
  it('Deve corresponder ao snapshot', () => {
    const tree = render(<FirstReleaseWarning />);

    expect(tree).toMatchSnapshot();
  });
});
