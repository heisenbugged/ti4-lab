import { useEffect, useRef, useState } from "react";

export function useDimensions<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (let entry of entries) {
        if (entry.target === ref.current) {
          const { width, height } = entry.contentRect;
          setDimensions({ width, height });
        }
      }
    };

    const observer = new ResizeObserver(handleResize);
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  return {
    ref,
    width: dimensions.width,
    height: dimensions.height,
  };
}
