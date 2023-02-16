import React from 'react';
import { render } from '@testing-library/react';
import FilterTreeInfos from '../FilterTreeInfos';

describe('FilterTreeInfos component', () => {
  it('should render correctly with default props', () => {
    const { asFragment } = render(
      <FilterTreeInfos
        checkedOptions={{}}
        setCheckedOptions={jest.fn()}
        characteristics={[]}
        subCharacteristics={[]}
        measures={[]}
        metrics={[]}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
