import { useMemo } from "react";

import { useThreads } from "@/liveblocks.config";

// Returns the highest z-index of all threads
export const useMaxZIndex = () => {
  const { threads } = useThreads();

  return useMemo(() => {
    let max = 0;
    for (const thread of threads) {
      const zIndex = thread.metadata?.zIndex ?? 0;
      if (zIndex > max) max = zIndex;
    }
    return max;
  }, [threads]);
};
