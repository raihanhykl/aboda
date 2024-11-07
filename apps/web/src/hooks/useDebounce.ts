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

// 'use client';

// import { useCallback, useRef } from 'react';

// const useDebounce = <T extends (...args: any[]) => any>(delay: number) => {
//   const timeoutRef = useRef<NodeJS.Timeout | null>(null);

//   const debouncedFunction = useCallback(
//     (func: T) => {
//       return (...args: Parameters<T>) => {
//         if (timeoutRef.current) {
//           clearTimeout(timeoutRef.current);
//         }

//         timeoutRef.current = setTimeout(() => {
//           func(...args);
//         }, delay);
//       };
//     },
//     [delay],
//   );

//   return debouncedFunction;
// };

// export default useDebounce;
