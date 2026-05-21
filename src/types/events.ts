/**
 * Minimal keyboard event shape accepted by the core helpers.
 *
 * @example
 * ```ts
 * const event: A11yKeyboardEvent = {
 *   key: "Enter",
 *   preventDefault() {}
 * };
 * ```
 */
export interface A11yKeyboardEvent {
  /** Keyboard key value, such as "ArrowDown", "Enter", or " ". */
  key: string;
  /** True when a consumer handler has already canceled the event default. */
  defaultPrevented?: boolean;
  /** Optional event method called when a handled key should not perform its browser default. */
  preventDefault?: () => void;
}

/**
 * Minimal pointer/click event shape accepted by option prop getters.
 *
 * @example
 * ```ts
 * const event: A11yClickEvent = {
 *   preventDefault() {}
 * };
 * ```
 */
export interface A11yClickEvent {
  /** True when a consumer handler has already canceled the event default. */
  defaultPrevented?: boolean;
  /** Optional event method for consumers that need to suppress default click behavior. */
  preventDefault?: () => void;
}
