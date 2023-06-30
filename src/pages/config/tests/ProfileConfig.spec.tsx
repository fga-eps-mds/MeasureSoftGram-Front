import { render, fireEvent, waitFor } from '@testing-library/react';
import ProfileConfig from '../ProfileConfig';
import '@testing-library/jest-dom';

jest.mock('@services/Auth', () => ({
  getAccessToken: jest.fn().mockResolvedValue({ type: 'success', value: { key: 'testKey' } })
}));

jest.mock('@hooks/useRequireAuth', () => jest.fn());

describe('ProfileConfig', () => {
  it('should render successfully', () => {
    const { container } = render(<ProfileConfig />);
    expect(container).toMatchSnapshot();
  });

  it('should handle toggle visibility click', async () => {
    const { getByLabelText } = render(<ProfileConfig />);
    const visibilityButton = getByLabelText('toggle password visibility');
    fireEvent.click(visibilityButton);

    await waitFor(() => {
      expect(visibilityButton).toBeInTheDocument();
    });
  });

  it('should handle copy api token click', async () => {
    const { getByLabelText } = render(<ProfileConfig />);
    const copyButton = getByLabelText('copy api token');

    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn()
      }
    });

    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });
  });
});
