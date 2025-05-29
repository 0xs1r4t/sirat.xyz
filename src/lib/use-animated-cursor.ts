import { useEffect } from "react";

const useAnimatedCursor = (frames: string[], interval = 150) => {
  useEffect(() => {
    if (!frames || frames.length === 0) return;

    let i = 0;
    let raf: number | null = null;
    let lastTime = Date.now();

    const updateCursor = () => {
      document.body.style.cursor = `url(${frames[i]}), auto`;
      i = (i + 1) % frames.length;
      raf = window.setTimeout(updateCursor, interval);
    };

    updateCursor();

    return () => {
      if (raf) clearTimeout(raf);
      document.body.style.cursor = "";
    };
  }, [frames, interval]);
};

export default useAnimatedCursor;
