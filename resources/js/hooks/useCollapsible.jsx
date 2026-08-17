import { useState, useRef, useEffect, useCallback } from 'react';

const useCollapsible = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const contentRef = useRef(null);
  const [height, setHeight] = useState('0px');

  // Effect to calculate height when content changes or initial render
  useEffect(() => {
    if (contentRef.current && isOpen) {
      setHeight(`${contentRef.current.scrollHeight}px`);
    } else if (!isOpen) {
      setHeight('0px');
    }
  }, [isOpen]); // Only re-calculate height when isOpen changes

  // Recalculate height if window resizes, or content changes dynamically
  // This is a simple debounced resize handler
  const updateHeight = useCallback(() => {
    if (contentRef.current && isOpen) {
      setHeight('auto'); // Set to auto first to get true scrollHeight if content changed
      requestAnimationFrame(() => {
        setHeight(`${contentRef.current.scrollHeight}px`);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [updateHeight]);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    toggle,
    contentRef,
    containerProps: {
      style: { height: height },
      className: 'overflow-hidden transition-all duration-300 ease-in-out',
    },
  };
};

export default useCollapsible;