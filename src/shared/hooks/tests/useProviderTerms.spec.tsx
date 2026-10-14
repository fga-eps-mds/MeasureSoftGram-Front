import { renderHook } from '@testing-library/react';
import { useProviderTerms } from '@hooks/useProviderTerms';
import { useAuth } from '@contexts/Auth';

jest.mock('@contexts/Auth', () => ({ useAuth: jest.fn() }));

describe('useProviderTerms', () => {
  it('atualiza os termos ao trocar o provider sem recarregar', () => {
    (useAuth as jest.Mock).mockReturnValue({ provider: 'github' });
    const { result, rerender } = renderHook(() => useProviderTerms());
    expect(result.current.terms.Repository).toBe('Repositório');
    expect(result.current.i18nContext).toBeUndefined();

    (useAuth as jest.Mock).mockReturnValue({ provider: 'gitlab' });
    rerender();
    expect(result.current.terms.Repository).toBe('Projeto');
    expect(result.current.i18nContext).toBe('gitlab');
  });
});
