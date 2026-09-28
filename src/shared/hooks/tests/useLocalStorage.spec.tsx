import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it('should return initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    expect(result.current.storedValue).toBe('initial');
  });

  it('should load stored value from localStorage on mount', () => {
    window.localStorage.setItem('test-key', JSON.stringify('stored-data'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    expect(result.current.storedValue).toBe('stored-data');
  });

  it('should fallback to initial value if localStorage contains invalid JSON', () => {
    window.localStorage.setItem('test-key', 'invalid-json{');
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    expect(result.current.storedValue).toBe('initial');
  });

  it('should update storedValue, persist to localStorage, and dispatch local-storage event', () => {
    const eventListener = jest.fn();
    window.addEventListener('local-storage', eventListener);

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current.setValue('updated');
    });

    expect(result.current.storedValue).toBe('updated');
    expect(JSON.parse(window.localStorage.getItem('test-key') || '')).toBe('updated');
    expect(eventListener).toHaveBeenCalledTimes(1);

    window.removeEventListener('local-storage', eventListener);
  });

  it('should support functional updates for setValue', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 10));

    act(() => {
      result.current.setValue((prev) => prev + 5);
    });

    expect(result.current.storedValue).toBe(15);
    expect(JSON.parse(window.localStorage.getItem('counter') || '')).toBe(15);
  });

  it('should NOT persist or dispatch local-storage event if value did not change', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent');

    const { result } = renderHook(() => useLocalStorage('test-key', { foo: 'bar' }));

    // Reset spies after mount
    setItemSpy.mockClear();
    dispatchSpy.mockClear();

    // Setting identical value
    act(() => {
      result.current.setValue({ foo: 'bar' });
    });

    expect(setItemSpy).not.toHaveBeenCalled();
    expect(dispatchSpy).not.toHaveBeenCalled();

    setItemSpy.mockRestore();
    dispatchSpy.mockRestore();
  });

  it('should maintain stable function references across re-renders (useCallback memoization)', () => {
    const { result, rerender } = renderHook(() => useLocalStorage('stable-key', 'value'));

    const initialSetValue = result.current.setValue;
    const initialRemoveValue = result.current.removeValue;

    rerender();

    expect(result.current.setValue).toBe(initialSetValue);
    expect(result.current.removeValue).toBe(initialRemoveValue);
  });

  it('should remove value, reset to initialValue, and dispatch event on removeValue', () => {
    window.localStorage.setItem('test-key', JSON.stringify('to-be-removed'));
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent');

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    dispatchSpy.mockClear();

    act(() => {
      result.current.removeValue();
    });

    expect(window.localStorage.getItem('test-key')).toBeNull();
    expect(result.current.storedValue).toBe('initial');
    expect(dispatchSpy).toHaveBeenCalledTimes(1);

    dispatchSpy.mockRestore();
  });

  it('should not dispatch event on removeValue if storage item is null and value is already initialValue', () => {
    const dispatchSpy = jest.spyOn(window, 'dispatchEvent');
    const { result } = renderHook(() => useLocalStorage('non-existent-key', 'initial'));

    dispatchSpy.mockClear();

    act(() => {
      result.current.removeValue();
    });

    expect(dispatchSpy).not.toHaveBeenCalled();
    dispatchSpy.mockRestore();
  });

  it('should catch and warn when localStorage.setItem throws an error', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });

    const { result } = renderHook(() => useLocalStorage('error-key', 'initial'));

    act(() => {
      result.current.setValue('new-value');
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error setting localStorage key'),
      expect.any(Error)
    );

    consoleWarnSpy.mockRestore();
    setItemSpy.mockRestore();
  });

  it('should catch and warn when localStorage.removeItem throws an error', () => {
    window.localStorage.setItem('error-key', JSON.stringify('val'));
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
    const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useLocalStorage('error-key', 'initial'));

    act(() => {
      result.current.removeValue();
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error removing localStorage key'),
      expect.any(Error)
    );

    consoleWarnSpy.mockRestore();
    removeItemSpy.mockRestore();
  });
});
