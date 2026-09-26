import React from 'react';
import { useRequestValues } from '@hooks/useRequestValues';
import { renderHook, waitFor } from '@testing-library/react';
import api from '@services/api';

jest.mock('@contexts/OrganizationProvider', () => ({
  useOrganizationContext: () => ({
    currentOrganization: { id: '1', name: 'Test Org' }
  })
}));

jest.mock('@contexts/ProductProvider', () => ({
  useProductContext: () => ({
    currentProduct: { id: '1', name: 'Test Product' }
  })
}));

jest.mock('@contexts/RepositoryProvider', () => ({
  useRepositoryContext: () => ({
    currentRepository: { id: '1', name: 'Test Repo' },
    historicalTSQMI: null
  })
}));

describe('useRequestValues', () => {
  it('should return an array of historical characteristics', async () => {
    jest.spyOn(api, 'get').mockResolvedValue({
      status: 200,
      statusText: 'OK',
      data: {
        results: [
          {
            id: 1,
            key: 'reliability',
            name: 'Reliability',
            description: null,
            history: [
              {
                id: 165,
                characteristic_id: 1,
                value: 0.8841939928977373,
                created_at: '2023-01-21T23:43:00-03:00'
              },
              {
                id: 167,
                characteristic_id: 1,
                value: 0.8841939928977373,
                created_at: '2023-01-31T14:49:00-03:00'
              },
              {
                id: 169,
                characteristic_id: 1,
                value: 0.8841939928977373,
                created_at: '2023-02-04T01:04:00-03:00'
              }
            ]
          }
        ]
      }
    });

    const { result } = renderHook(() =>
      useRequestValues({
        type: 'historical-values',
        value: 'characteristics'
      })
    );

    expect(api.get).toHaveBeenCalled();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].key).toBe('reliability');
    expect(result.current.data[0].history).toHaveLength(3);
  });
});
