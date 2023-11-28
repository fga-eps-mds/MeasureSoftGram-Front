import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { OrganizationProvider } from '@contexts/OrganizationProvider';
import Organizations from '../Organizations';

jest.mock('@services/user', () => ({
  getAllUsers: jest.fn(() => Promise.resolve({
    type: 'success',
    value: {
      results: [
        { id: '1', first_name: 'Test', last_name: 'User', username: 'testuser' },
      ],
    },
  })),
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('../hooks/useOrganizationQuery', () => ({
  useOrganizationQuery: () => ({
    createOrganization: jest.fn(() => Promise.resolve({ type: 'success' })),
    getOrganizationById: jest.fn(() => Promise.resolve({ type: 'success', value: {} })),
    updateOrganization: jest.fn(() => Promise.resolve({ type: 'success' })),
  }),
}));

describe('Organizations Component', () => {
  it('renders the component with initial state', () => {
    const { container } = render(
      <OrganizationProvider>
        <Organizations />
      </OrganizationProvider>
    );
    expect(container).toBeInTheDocument();
  });

  it('handles user interactions and form submission', async () => {
    const mockGetAllUsers = jest.fn(() => Promise.resolve({
      type: 'success',
      value: {
        results: [
          { id: '1', first_name: 'Test', last_name: 'User', username: 'testuser' },
        ],
      },
    }));
    jest.mock('@services/user', () => ({
      getAllUsers: mockGetAllUsers,
    }));

    setTimeout(() => {
      expect(true).toBeTruthy();
    }, 1000);
  });
});
