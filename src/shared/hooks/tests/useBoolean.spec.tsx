import useBoolean from '@hooks/useBoolean';
import { renderHook, act } from '@testing-library/react';

describe('useBoolean', () => {
  test('should return false when initialized with undefined', () => {
    const { result } = renderHook(() => useBoolean());
    expect(result.current.value).toBe(false);
  });

  test('should return false when initialized with false', () => {
    const { result } = renderHook(() => useBoolean(false));
    expect(result.current.value).toBe(false);
  });

  test('should return true when initialized with true', () => {
    const { result } = renderHook(() => useBoolean(true));
    expect(result.current.value).toBe(true);
  });

  test('should return true when setTrue is called', () => {
    const { result } = renderHook(() => useBoolean(false));
    act(() => result.current.setTrue());
    expect(result.current.value).toBe(true);
  });

  test('should return false when setFalse is called', () => {
    const { result } = renderHook(() => useBoolean(true));
    act(() => result.current.setFalse());
    expect(result.current.value).toBe(false);
  });

  test('should return false when toggle is called', () => {
    const { result } = renderHook(() => useBoolean(true));
    act(() => result.current.toggle());
    expect(result.current.value).toBe(false);
  });
});
