'use client';
import { useRef } from 'react';

const useDebounce = () => {
  const debounceTimeOut = useRef<NodeJS.Timeout | null>(null);
  const debounce = (func: Function, delay: number) => {
    return () => {
      if (debounceTimeOut.current) clearTimeout(debounceTimeOut.current);
      debounceTimeOut.current = setTimeout(() => {
        func();
        debounceTimeOut.current = null;
      }, delay);
    };
  };
  return { debounce };
};

export default useDebounce;
