import { useEffect, useState } from "react";

export function useWindowDimensions() {
  const window = getSafeWindow();
  const [windowDimensions, setWindowDimensions] = useState({
    width: window?.innerWidth ?? 0,
    height: window?.innerHeight ?? 0,
  });

  useEffect(() => {
    if (!window) return;

    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Add event listener to window resize
    window.addEventListener("resize", handleResize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [window]);

  return { width: windowDimensions.width, height: windowDimensions.height };
}

const getSafeWindow = () => {
  if (typeof window !== "undefined") {
    return window;
  }
  return undefined;
};
