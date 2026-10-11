import { useEffect, useState } from "react";

const readWindow = () =>
  typeof window === "undefined"
    ? { width: 0, height: 0 }
    : { width: window.innerWidth, height: window.innerHeight };

export function useWindowDimensions() {
  const [dimensions, setDimensions] = useState(readWindow);

  useEffect(() => {
    const handleResize = () => setDimensions(readWindow());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return dimensions;
}
