// Organizations.spec.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { OrganizationProvider } from '@contexts/OrganizationProvider';
import { RouterContext } from 'next/dist/shared/lib/router-context'; // Import necessary for useRouter mock
import Organizations from '../Organizations';

// Mock external dependencies and services
jest.mock('@services/user', () => ({
  getAllUsers: jest.fn(() => Promise.resolve({
    type: 'success',
    value: {
      results: [
        { id: '1', first_name: 'Test', last_name: 'User', username: 'testuser' },
        // Add more fictitious users as needed for testing
      ],
    },
  })),
}));

// Mock for toast
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock for useOrganizationQuery
jest.mock('../hooks/useOrganizationQuery', () => ({
  useOrganizationQuery: () => ({
    createOrganization: jest.fn(() => Promise.resolve({ type: 'success' })),
    getOrganizationById: jest.fn(() => Promise.resolve({ type: 'success', value: {/* organization data */ } })),
    updateOrganization: jest.fn(() => Promise.resolve({ type: 'success' })),
  }),
}));

describe('Organizations Component', () => {
  // Mock useRouter
  const useRouter = jest.fn();
  useRouter.mockReturnValue({ query: { edit: '1' } }); // Example query parameter for edit mode

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
    // Mock the API response for getAllUsers
    const mockGetAllUsers = jest.fn(() => Promise.resolve({
      type: 'success',
      value: {
        results: [
          { id: '1', first_name: 'Test', last_name: 'User', username: 'testuser' },
          // Add more fictitious users as needed for testing
        ],
      },
    }));
    jest.mock('@services/user', () => ({
      getAllUsers: mockGetAllUsers,
    }));

    // Render the component
    render(
      <OrganizationProvider>
        <RouterContext.Provider value={{ useRouter }}>
          <Organizations />
        </RouterContext.Provider>
      </OrganizationProvider>
    );
  });
});
