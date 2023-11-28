import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import Organizations from '../Organizations';
import { OrganizationProvider } from '@contexts/OrganizationProvider';


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
    getOrganizationById: jest.fn(() => Promise.resolve({ type: 'success', value: {/* organization data */ } })),
    updateOrganization: jest.fn(() => Promise.resolve({ type: 'success' })),
  }),
}));

describe('Organizations Component', () => {
  const useRouter = jest.fn();
  useRouter.mockReturnValue({ query: { edit: '1' } });

  it('renders the component with initial state', () => {
    render(
      <OrganizationProvider>
        <RouterContext.Provider value={{ useRouter }}>
          <Organizations />
        </RouterContext.Provider>
      </OrganizationProvider>
    );
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

    render(
      <OrganizationProvider>
        <RouterContext.Provider value={{ useRouter }}>
          <Organizations />
        </RouterContext.Provider>
      </OrganizationProvider>
    );
  });
});
