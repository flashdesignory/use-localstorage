import { renderHook, act } from '@testing-library/react-hooks';

import useLocalStorage from './index';

describe('useLocalStorage', () => {
  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('retrieves an existing value from localStorage', () => {
    localStorage.setItem('test', JSON.stringify('bar'));
    const { result } = renderHook(() => useLocalStorage('test', 'baz'));
    const [state] = result.current;
    expect(state).toEqual('bar');
  });

  it('should return initialValue if localStorage empty and set that to localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test', 'bar'));
    const [state] = result.current;
    expect(state).toEqual('bar');
    const item = localStorage.getItem('test') || "";
    const parsedItem = JSON.parse(item);
    expect(parsedItem).toEqual('bar');
  });

  it('should return initialValue if localStorage does not exist', () => {
    const originalLocalStorage = localStorage;
    // @ts-ignore
    localStorage = undefined;
    const { result } = renderHook(() => useLocalStorage('test', 'bar'));
    const [state] = result.current;
    expect(state).toEqual('bar');
    localStorage = originalLocalStorage;
  });

  it('should return initialValue if localStorage throws an error', () => {
    const consoleErrorSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const originalLocalStorage = localStorage;
    Object.defineProperty(window, 'localStorage', {
      writable: true,
      value: {
        getItem: () => {
          throw new Error('could not get');
        },
        setItem: () => {
          throw new Error('could not set');
        },
      },
    });
    const { result } = renderHook(() => useLocalStorage('test', 'bar'));
    const [state] = result.current;
    expect(state).toEqual('bar');
    global.localStorage = originalLocalStorage;
    consoleErrorSpy.mockRestore();
  });

  it('should throw an error if writing to localStorage fails', () => {
    const consoleErrorSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const originalLocalStorage = localStorage;
    Object.defineProperty(window, 'localStorage', {
      writable: true,
      value: {
        getItem: () => {
          throw new Error('could not get');
        },
        setItem: () => {
          throw new Error('could not set');
        },
      },
    });
    const { result } = renderHook(() => useLocalStorage('test', 'bar'));
    const [, setValue] = result.current;
    setValue('baz');
    expect(consoleErrorSpy).toHaveBeenCalled();
    global.localStorage = originalLocalStorage;
    consoleErrorSpy.mockRestore();
  });

  it('prefers existing value over initial state', () => {
    localStorage.setItem('test', JSON.stringify('bar'));
    const { result } = renderHook(() => useLocalStorage('test', 'baz'));
    const [state] = result.current;
    expect(state).toEqual('bar');
  });

  it('does not override existing localStorage with initialState', () => {
    localStorage.setItem('test', JSON.stringify('bar'));
    const { result } = renderHook(() => useLocalStorage('test', 'buzz'));
    expect(result.current).toBeTruthy();
    const item = localStorage.getItem('test') || "";
    const parsedItem = JSON.parse(item);
    expect(parsedItem).toEqual('bar');
  });

  it('correctly updates localStorage', () => {
    const { result, rerender } = renderHook(() =>
      useLocalStorage('test', 'bar')
    );

    const [, setValue] = result.current;
    act(() => setValue('baz'));
    rerender();

    const item = localStorage.getItem('test') || "";
    const parsedItem = JSON.parse(item);
    expect(parsedItem).toEqual('baz');
  });
  
  it('returns a new value without additional renders', () => {
    const { result, rerender } = renderHook(() =>
      useLocalStorage('test', 'bar')
    );

    const [, setValue] = result.current;
    act(() => setValue('baz'));
    rerender();

    const [test] = result.current;
    expect(test).toEqual('baz');
  });

  it('rejects nullish or undefined keys', () => {
    const { result } = renderHook(() => useLocalStorage(null as any, 'bar'));
    try {
      (() => {
        return result.current;
      })();
    } catch (e) {
      expect(String(e)).toMatch(/A valid key should be provided to useLocalStorage/i);
    }
  });

  describe('eslint react-hooks/rules-of-hooks', () => {
    it('memoizes an object between re-renders', () => {
      const { result, rerender } = renderHook(() =>
        useLocalStorage('test', 'ok')
      );
      (() => {
        return result.current; // if localStorage isn't set then r1 and r2 will be different
      })();
      rerender();
      const [r2] = result.current;
      rerender();
      const [r3] = result.current;
      expect(r2).toBe(r3);
    });

    it('memoizes an object immediately if localStorage is already set', () => {
      localStorage.setItem('test', JSON.stringify('bar'));
      const { result, rerender } = renderHook(() =>
        useLocalStorage('test', 'bar')
      );

      const [r1] = result.current; // if localStorage isn't set then r1 and r2 will be different
      rerender();
      const [r2] = result.current;
      expect(r1).toBe(r2);
    });

    it('memoizes the setState function', () => {
      localStorage.setItem('test', JSON.stringify('bar'));
      const { result, rerender } = renderHook(() =>
        useLocalStorage('test', 'baz')
      );
      const [, s1] = result.current;
      rerender();
      const [, s2] = result.current;
      expect(s1).toBe(s2);
    });
  });
});