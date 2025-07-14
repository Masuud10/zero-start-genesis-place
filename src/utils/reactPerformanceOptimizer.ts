/**
 * React Performance Optimization Utilities
 * This module fixes common React performance issues and provides optimization helpers
 */

import { useCallback, useRef, useEffect, useMemo, DependencyList } from 'react';

/**
 * Custom hook to prevent infinite re-renders by stabilizing callback functions
 * FIXED: Ensures callbacks don't cause unnecessary re-renders
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  dependencies: DependencyList = []
): T {
  const callbackRef = useRef<T>(callback);
  callbackRef.current = callback;

  return useCallback(
    ((...args: unknown[]) => {
      return callbackRef.current(...args);
    }) as T,
    dependencies
  );
}

/**
 * Custom hook to prevent useEffect from running on every render
 * FIXED: Ensures useEffect only runs when dependencies actually change
 */
export function useStableEffect(
  effect: () => void | (() => void),
  dependencies: DependencyList,
  options: {
    skipFirstRun?: boolean;
    cleanupOnUnmount?: boolean;
  } = {}
) {
  const { skipFirstRun = false, cleanupOnUnmount = true } = options;
  const isFirstRun = useRef(true);
  const cleanupRef = useRef<(() => void) | void>();

  useEffect(() => {
    if (skipFirstRun && isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    // Clean up previous effect
    if (cleanupRef.current) {
      cleanupRef.current();
    }

    // Run new effect
    cleanupRef.current = effect();

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, dependencies);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupOnUnmount && cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [cleanupOnUnmount]);
}

/**
 * Custom hook to memoize expensive calculations
 * FIXED: Prevents unnecessary recalculations
 */
export function useMemoizedValue<T>(
  factory: () => T,
  dependencies: DependencyList,
  options: {
    equalityFn?: (prev: T, next: T) => boolean;
    maxAge?: number;
  } = {}
) {
  const { equalityFn, maxAge } = options;
  const lastValueRef = useRef<T>();
  const lastDepsRef = useRef<DependencyList>();
  const lastTimeRef = useRef<number>(0);

  return useMemo(() => {
    const now = Date.now();
    const depsChanged = !lastDepsRef.current || 
      dependencies.length !== lastDepsRef.current.length ||
      dependencies.some((dep, index) => dep !== lastDepsRef.current![index]);

    const timeExpired = maxAge && (now - lastTimeRef.current) > maxAge;

    if (depsChanged || timeExpired) {
      const newValue = factory();
      
      // Check if value actually changed
      if (lastValueRef.current !== undefined && equalityFn) {
        if (equalityFn(lastValueRef.current, newValue)) {
          return lastValueRef.current;
        }
      }

      lastValueRef.current = newValue;
      lastDepsRef.current = dependencies;
      lastTimeRef.current = now;
      return newValue;
    }

    return lastValueRef.current!;
  }, dependencies);
}

/**
 * Custom hook to debounce state updates
 * FIXED: Prevents excessive state updates
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 300
): [T, (value: T) => void, T] {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const setDebouncedValueCallback = useCallback((newValue: T) => {
    setValue(newValue);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(newValue);
    }, delay);
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [value, setDebouncedValueCallback, debouncedValue];
}

/**
 * Custom hook to throttle function calls
 * FIXED: Prevents excessive function calls
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number = 300,
  dependencies: DependencyList = []
): T {
  const lastCallRef = useRef<number>(0);
  const callbackRef = useRef<T>(callback);
  callbackRef.current = callback;

  return useCallback(
    ((...args: unknown[]) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        return callbackRef.current(...args);
      }
    }) as T,
    [delay, ...dependencies]
  );
}

/**
 * Custom hook to prevent memory leaks in async operations
 * FIXED: Ensures async operations are properly cleaned up
 */
export function useAsyncOperation<T>(
  asyncFn: () => Promise<T>,
  dependencies: DependencyList = []
): {
  execute: () => Promise<T | null>;
  isExecuting: boolean;
  error: Error | null;
  result: T | null;
} {
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const execute = useCallback(async () => {
    if (isExecuting) return null;

    setIsExecuting(true);
    setError(null);
    
    // Abort previous operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    try {
      const data = await asyncFn();
      
      if (isMountedRef.current) {
        setResult(data);
        return data;
      }
      return null;
    } catch (err) {
      if (isMountedRef.current && !abortControllerRef.current?.signal.aborted) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
      }
      return null;
    } finally {
      if (isMountedRef.current) {
        setIsExecuting(false);
      }
    }
  }, [asyncFn, isExecuting, ...dependencies]);

  return { execute, isExecuting, error, result };
}

/**
 * Custom hook to optimize list rendering
 * FIXED: Prevents unnecessary re-renders of list items
 */
export function useOptimizedList<T>(
  items: T[],
  keyExtractor: (item: T, index: number) => string | number,
  options: {
    maxItems?: number;
    sortFn?: (a: T, b: T) => number;
    filterFn?: (item: T) => boolean;
  } = {}
) {
  const { maxItems, sortFn, filterFn } = options;

  return useMemo(() => {
    let processedItems = [...items];

    if (filterFn) {
      processedItems = processedItems.filter(filterFn);
    }

    if (sortFn) {
      processedItems.sort(sortFn);
    }

    if (maxItems) {
      processedItems = processedItems.slice(0, maxItems);
    }

    return processedItems.map((item, index) => ({
      item,
      key: keyExtractor(item, index),
      index
    }));
  }, [items, keyExtractor, maxItems, sortFn, filterFn]);
}

/**
 * Custom hook to prevent stale closures in event handlers
 * FIXED: Ensures event handlers always have access to latest state
 */
export function useEventCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  dependencies: DependencyList = []
): T {
  const callbackRef = useRef<T>(callback);
  callbackRef.current = callback;

  return useCallback(
    ((...args: unknown[]) => {
      return callbackRef.current(...args);
    }) as T,
    dependencies
  );
}

/**
 * Custom hook to manage component lifecycle
 * FIXED: Provides proper cleanup and lifecycle management
 */
export function useComponentLifecycle(options: {
  onMount?: () => void | (() => void);
  onUnmount?: () => void;
  onUpdate?: () => void;
} = {}) {
  const { onMount, onUnmount, onUpdate } = options;
  const isMountedRef = useRef(false);
  const cleanupRef = useRef<(() => void) | void>();

  useEffect(() => {
    isMountedRef.current = true;
    
    if (onMount) {
      cleanupRef.current = onMount();
    }

    return () => {
      isMountedRef.current = false;
      
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      
      if (onUnmount) {
        onUnmount();
      }
    };
  }, []);

  useEffect(() => {
    if (isMountedRef.current && onUpdate) {
      onUpdate();
    }
  });

  return {
    isMounted: () => isMountedRef.current
  };
}

/**
 * Utility to check if dependencies have actually changed
 * FIXED: Prevents unnecessary effect runs
 */
export function dependenciesChanged(
  prevDeps: DependencyList,
  nextDeps: DependencyList
): boolean {
  if (prevDeps.length !== nextDeps.length) {
    return true;
  }

  return prevDeps.some((dep, index) => {
    const nextDep = nextDeps[index];
    
    // Handle null/undefined
    if (dep === null || dep === undefined) {
      return nextDep !== dep;
    }
    
    // Handle objects and arrays
    if (typeof dep === 'object') {
      return JSON.stringify(dep) !== JSON.stringify(nextDep);
    }
    
    // Handle primitives
    return dep !== nextDep;
  });
}

/**
 * Hook to create stable object references
 * FIXED: Prevents unnecessary re-renders due to object reference changes
 */
export function useStableObject<T extends Record<string, unknown>>(
  obj: T,
  keys: (keyof T)[] = Object.keys(obj) as (keyof T)[]
): T {
  return useMemo(() => {
    const stableObj = {} as T;
    keys.forEach(key => {
      stableObj[key] = obj[key];
    });
    return stableObj;
  }, keys.map(key => obj[key]));
}

/**
 * Utility to batch state updates
 * FIXED: Prevents multiple re-renders from multiple state updates
 */
export function useBatchedState<T>(
  initialState: T
): [T, (updates: Partial<T> | ((prev: T) => Partial<T>)) => void] {
  const [state, setState] = useState<T>(initialState);
  const batchRef = useRef<Partial<T>>({});
  const timeoutRef = useRef<NodeJS.Timeout>();

  const batchedSetState = useCallback((
    updates: Partial<T> | ((prev: T) => Partial<T>)
  ) => {
    const newUpdates = typeof updates === 'function' ? updates(state) : updates;
    
    Object.assign(batchRef.current, newUpdates);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, ...batchRef.current }));
      batchRef.current = {};
    }, 0);
  }, [state]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, batchedSetState];
}

// Import useState for the hooks that need it
import { useState } from 'react'; 