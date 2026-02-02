import { useCallback } from 'react';

export function useBatchOperations(drillState, setDrillState) {
  const addLearnedItem = useCallback(
    (itemId) => {
      if (!drillState.currentMode || !itemId) return;
      setDrillState((prev) => {
        const currentMode = drillState.currentMode;
        const currentCount = prev.itemSuccessCounts[currentMode]?.[itemId] || 0;
        const currentLearnedItems = prev.learnedItems[currentMode] || [];
        return {
          ...prev,
          learnedItems: {
            ...prev.learnedItems,
            [currentMode]: currentLearnedItems.includes(itemId)
              ? currentLearnedItems
              : [...currentLearnedItems, itemId]
          },
          itemSuccessCounts: {
            ...prev.itemSuccessCounts,
            [currentMode]: {
              ...prev.itemSuccessCounts[currentMode],
              [itemId]: currentCount + 1
            }
          }
        };
      });
    },
    [drillState.currentMode, setDrillState]
  );

  return { addLearnedItem };
}