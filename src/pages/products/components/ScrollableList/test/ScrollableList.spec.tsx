import React from 'react';
import { render } from '@testing-library/react';
import ScrollableList from '../ScrollableList';

describe('ScrollableList Component', () => {

  it('Deve corresponder ao Snapshot', () => {
    const tree = render(<ScrollableList organizationList={[{
      id: "1", name: 'Organization 1', 'description': "string", 'url': 'abc',
      key: '',
      products: [],
    }]}
      onSelect={() => { }}
    />);
    expect(tree).toMatchSnapshot();
  });
});
