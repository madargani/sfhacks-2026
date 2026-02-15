import { useEffect, useRef } from "react";
import type { ScrollView as ScrollViewType } from "react-native";

export const SCROLLER_ITEM_HEIGHT = 50;
export const SCROLLER_PADDING = 75;

export const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

export const getScrollOffsetY = (event: any) => {
  const nativeOffset = event?.nativeEvent?.contentOffset?.y;
  if (typeof nativeOffset === "number") {
    return nativeOffset;
  }
  const nativeTargetOffset = event?.nativeEvent?.target?.scrollTop;
  if (typeof nativeTargetOffset === "number") {
    return nativeTargetOffset;
  }
  const currentTargetOffset = event?.currentTarget?.scrollTop;
  if (typeof currentTargetOffset === "number") {
    return currentTargetOffset;
  }
  const targetOffset = event?.target?.scrollTop;
  if (typeof targetOffset === "number") {
    return targetOffset;
  }
  return 0;
};

export const getScrollerIndex = (offsetY: number) => {
  return Math.round(
    (offsetY + SCROLLER_ITEM_HEIGHT / 2) / SCROLLER_ITEM_HEIGHT
  );
};

export const scrollToIndex = (
  ref: { current: ScrollViewType | null },
  index: number
) => {
  ref.current?.scrollTo({ y: index * SCROLLER_ITEM_HEIGHT, animated: true });
};

export const useRafScrollScheduler = () => {
  const webScrollRafRef = useRef<number | null>(null);
  const webScrollOffsetRef = useRef(0);

  useEffect(() => {
    return () => {
      if (webScrollRafRef.current !== null) {
        cancelAnimationFrame(webScrollRafRef.current);
        webScrollRafRef.current = null;
      }
    };
  }, []);

  const schedule = (offsetY: number, handler: (nextOffset: number) => void) => {
    if (!Number.isFinite(offsetY)) {
      return;
    }
    webScrollOffsetRef.current = offsetY;
    if (webScrollRafRef.current !== null) {
      return;
    }
    webScrollRafRef.current = requestAnimationFrame(() => {
      webScrollRafRef.current = null;
      handler(webScrollOffsetRef.current);
    });
  };

  return { schedule };
};
