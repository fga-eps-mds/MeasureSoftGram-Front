import { render } from '@testing-library/react';
import ProfileConfig from '../ProfileConfig';

describe('ProfileConfig', () => {
  it('should render successfully', () => {
    const { container } = render(<ProfileConfig />);
    expect(container).toMatchSnapshot();
  });
});
