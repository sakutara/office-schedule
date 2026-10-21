export interface SwipePoint {
  x: number;
  y: number;
}

const INTERACTIVE_SELECTOR =
  'button, a, input, textarea, select, label, [role="button"], [contenteditable="true"], [data-no-swipe="true"]';

export function isBlankSwipeTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof Element)) return true;
  return !target.closest(INTERACTIVE_SELECTOR);
}

export function resolveNextTabIndex(
  currentIndex: number,
  totalTabs: number,
  start: SwipePoint,
  end: SwipePoint,
  minSwipeDistance = 48,
  maxVerticalRatio = 0.75
): number {
  if (totalTabs <= 1) return currentIndex;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (Math.abs(dx) < minSwipeDistance) return currentIndex;
  if (Math.abs(dy) > Math.abs(dx) * maxVerticalRatio) return currentIndex;

  if (dx < 0) {
    return Math.min(totalTabs - 1, currentIndex + 1);
  }
  return Math.max(0, currentIndex - 1);
}
