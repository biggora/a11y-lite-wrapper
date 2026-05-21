/**
 * Action reported by keyboard navigation.
 *
 * @example
 * ```ts
 * const action: KeyboardNavigationAction = "move";
 * ```
 */
export type KeyboardNavigationAction = "none" | "move" | "escape" | "select";

/**
 * Input for {@link getKeyboardNavigationResult}.
 *
 * @example
 * ```ts
 * const input: KeyboardNavigationInput = {
 *   key: "ArrowDown",
 *   activeIndex: -1,
 *   itemCount: 3,
 *   loop: true
 * };
 * ```
 */
export interface KeyboardNavigationInput {
  /** Keyboard key value to evaluate. */
  key: string;
  /** Current active item index, or -1 when no item is active. */
  activeIndex: number;
  /** Total number of items in the collection. */
  itemCount: number;
  /** Returns true when the item at the index cannot receive active or selected state. */
  isItemDisabled?: (index: number) => boolean;
  /** Enables wrapping from end to start and start to end for arrow movement. */
  loop?: boolean;
}

/**
 * Result returned by {@link getKeyboardNavigationResult}.
 *
 * @example
 * ```ts
 * const result: KeyboardNavigationResult = {
 *   activeIndex: 0,
 *   action: "move",
 *   shouldPreventDefault: true
 * };
 * ```
 */
export interface KeyboardNavigationResult {
  /** Next active index, or the original active index when no movement occurred. */
  activeIndex: number;
  /** Semantic action represented by the key. */
  action: KeyboardNavigationAction;
  /** Whether callers should call preventDefault on the original event. */
  shouldPreventDefault: boolean;
}

/**
 * Computes list-style keyboard navigation without side effects.
 *
 * @example
 * ```ts
 * const result = getKeyboardNavigationResult({
 *   key: "ArrowDown",
 *   activeIndex: 0,
 *   itemCount: 3,
 *   isItemDisabled: (index) => index === 1,
 *   loop: true
 * });
 *
 * result.activeIndex; // 2
 * ```
 */
export function getKeyboardNavigationResult(input: KeyboardNavigationInput): KeyboardNavigationResult {
  const isDisabled = input.isItemDisabled ?? (() => false);

  switch (input.key) {
    case "Escape":
      return actionResult(input.activeIndex, "escape", true);
    case "Enter":
    case " ":
    case "Spacebar":
      return actionResult(input.activeIndex, "select", true);
    case "ArrowDown":
      return moveBy(input.activeIndex, input.itemCount, 1, input.loop === true, isDisabled);
    case "ArrowUp":
      return moveBy(input.activeIndex, input.itemCount, -1, input.loop === true, isDisabled);
    case "Home":
      return moveToEdge(input.activeIndex, input.itemCount, 1, isDisabled);
    case "End":
      return moveToEdge(input.activeIndex, input.itemCount, -1, isDisabled);
    default:
      return actionResult(input.activeIndex, "none", false);
  }
}

function actionResult(
  activeIndex: number,
  action: KeyboardNavigationAction,
  shouldPreventDefault: boolean
): KeyboardNavigationResult {
  return { activeIndex, action, shouldPreventDefault };
}

function moveBy(
  activeIndex: number,
  itemCount: number,
  step: 1 | -1,
  loop: boolean,
  isDisabled: (index: number) => boolean
): KeyboardNavigationResult {
  if (itemCount <= 0) {
    return actionResult(-1, "none", false);
  }

  const startIndex = normalizeStartIndex(activeIndex, itemCount, step);
  let nextIndex = startIndex + step;

  for (let checked = 0; checked < itemCount; checked += 1) {
    if (nextIndex < 0 || nextIndex >= itemCount) {
      if (!loop) {
        return actionResult(activeIndex, "none", false);
      }

      nextIndex = step === 1 ? 0 : itemCount - 1;
    }

    if (!isDisabled(nextIndex)) {
      if (nextIndex === activeIndex) {
        return actionResult(activeIndex, "none", false);
      }

      return actionResult(nextIndex, "move", true);
    }

    nextIndex += step;
  }

  return actionResult(activeIndex, "none", false);
}

function moveToEdge(
  activeIndex: number,
  itemCount: number,
  step: 1 | -1,
  isDisabled: (index: number) => boolean
): KeyboardNavigationResult {
  if (itemCount <= 0) {
    return actionResult(-1, "none", false);
  }

  let nextIndex = step === 1 ? 0 : itemCount - 1;

  while (nextIndex >= 0 && nextIndex < itemCount) {
    if (!isDisabled(nextIndex)) {
      if (nextIndex === activeIndex) {
        return actionResult(activeIndex, "none", false);
      }

      return actionResult(nextIndex, "move", true);
    }

    nextIndex += step;
  }

  return actionResult(activeIndex, "none", false);
}

function normalizeStartIndex(activeIndex: number, itemCount: number, step: 1 | -1): number {
  if (activeIndex >= 0 && activeIndex < itemCount) {
    return activeIndex;
  }

  return step === 1 ? -1 : itemCount;
}
