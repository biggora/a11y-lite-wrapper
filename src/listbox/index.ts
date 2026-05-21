import { getKeyboardNavigationResult } from "../keyboard";
import type { A11yClickEvent, A11yKeyboardEvent } from "../types";

/**
 * Options for {@link createListboxA11y}.
 *
 * @example
 * ```ts
 * const options: CreateListboxA11yOptions<{ id: string; label: string }> = {
 *   id: "size",
 *   options: [{ id: "small", label: "Small" }],
 *   activeIndex: 0,
 *   selectedIndex: 0,
 *   getOptionId: (option) => option.id
 * };
 * ```
 */
export interface CreateListboxA11yOptions<TOption> {
  /** DOM id for the listbox root. */
  id: string;
  /** Consumer-owned option data. */
  options: readonly TOption[];
  /** Current active option index, or -1 when none is active. */
  activeIndex: number;
  /** Current selected option index, or -1 when none is selected. */
  selectedIndex: number;
  /** Maps an option to its DOM id. */
  getOptionId: (option: TOption, index: number) => string;
  /** Returns true when an option cannot be selected or activated. */
  isOptionDisabled?: (option: TOption, index: number) => boolean;
  /** Called when an enabled option is selected. */
  onSelect?: (option: TOption, index: number) => void;
  /** Called when keyboard navigation requests a new active index. */
  onActiveIndexChange?: (index: number) => void;
  /** Enables wrapping keyboard movement. */
  loop?: boolean;
}

/**
 * Root props returned by {@link createListboxA11y}.
 *
 * @example
 * ```ts
 * const rootProps: ListboxRootProps = {
 *   id: "size",
 *   role: "listbox",
 *   tabIndex: 0
 * };
 * ```
 */
export interface ListboxRootProps {
  id: string;
  role: "listbox";
  tabIndex: 0;
  "aria-activedescendant"?: string | undefined;
  onKeyDown?: (event: A11yKeyboardEvent) => void;
}

/**
 * Consumer props accepted by {@link ListboxA11y.getRootProps}.
 */
export interface ListboxRootUserProps {
  onKeyDown?: (event: A11yKeyboardEvent) => void;
  [prop: string]: unknown;
}

/**
 * Option props returned by {@link createListboxA11y}.
 *
 * @example
 * ```ts
 * const optionProps: ListboxOptionProps = {
 *   id: "small",
 *   role: "option",
 *   "aria-selected": true,
 *   "aria-disabled": undefined
 * };
 * ```
 */
export interface ListboxOptionProps {
  id: string;
  role: "option";
  "aria-selected": boolean;
  "aria-disabled": boolean | undefined;
  onClick?: (event?: A11yClickEvent) => void;
}

/**
 * Consumer props accepted by {@link ListboxA11y.getOptionProps}.
 */
export interface ListboxOptionUserProps {
  onClick?: (event?: A11yClickEvent) => void;
  [prop: string]: unknown;
}

/**
 * Stable ids used by the listbox helper.
 */
export interface ListboxA11yIds {
  /** DOM id for the listbox root. */
  root: string;
}

/**
 * Headless listbox prop getter API.
 *
 * @example
 * ```ts
 * const listbox = createListboxA11y({
 *   id: "size",
 *   options: [{ id: "small", label: "Small" }],
 *   activeIndex: 0,
 *   selectedIndex: -1,
 *   getOptionId: (option) => option.id
 * });
 *
 * listbox.getRootProps();
 * listbox.getOptionProps(0);
 * ```
 */
export interface ListboxA11y<TOption> {
  getRootProps: <TUserProps extends ListboxRootUserProps = ListboxRootUserProps>(
    userProps?: TUserProps
  ) => Omit<TUserProps, keyof ListboxRootProps> & ListboxRootProps;
  getOptionProps: <TUserProps extends ListboxOptionUserProps = ListboxOptionUserProps>(
    index: number,
    userProps?: TUserProps
  ) => Omit<TUserProps, keyof ListboxOptionProps> & ListboxOptionProps;
  readonly ids: ListboxA11yIds;
  readonly options: readonly TOption[];
}

/**
 * Creates headless ARIA props and event handlers for a controlled listbox.
 *
 * @example
 * ```ts
 * const listbox = createListboxA11y({
 *   id: "size",
 *   options: [{ id: "small", label: "Small" }],
 *   activeIndex: 0,
 *   selectedIndex: 0,
 *   getOptionId: (option) => option.id,
 *   onSelect: (option) => console.log(option.label)
 * });
 * ```
 */
export function createListboxA11y<TOption>(
  options: CreateListboxA11yOptions<TOption>
): ListboxA11y<TOption> {
  const isOptionDisabled = (index: number): boolean => {
    const option = options.options[index];
    return option === undefined ? true : options.isOptionDisabled?.(option, index) === true;
  };

  const getActiveOptionId = (): string | undefined => {
    const option = options.options[options.activeIndex];
    return option === undefined || isOptionDisabled(options.activeIndex)
      ? undefined
      : options.getOptionId(option, options.activeIndex);
  };

  const selectOption = (index: number): boolean => {
    const option = options.options[index];
    if (option === undefined || isOptionDisabled(index)) {
      return false;
    }

    options.onSelect?.(option, index);
    return true;
  };

  return {
    ids: { root: options.id },
    options: options.options,
    getRootProps: (userProps) => {
      const props = userProps ?? ({} as ListboxRootUserProps);
      const { onKeyDown, ...restUserProps } = props;

      return {
        ...restUserProps,
        id: options.id,
        role: "listbox",
        tabIndex: 0,
        "aria-activedescendant": getActiveOptionId(),
        onKeyDown: (event) => {
          onKeyDown?.(event);

          if (event.defaultPrevented === true) {
            return;
          }

          const result = getKeyboardNavigationResult({
            key: event.key,
            activeIndex: options.activeIndex,
            itemCount: options.options.length,
            isItemDisabled: isOptionDisabled,
            loop: options.loop === true
          });

          if (result.action === "move") {
            event.preventDefault?.();
            options.onActiveIndexChange?.(result.activeIndex);
            return;
          }

          if (result.action === "select" && selectOption(options.activeIndex)) {
            event.preventDefault?.();
          }
        }
      } as Omit<NonNullable<typeof userProps>, keyof ListboxRootProps> & ListboxRootProps;
    },
    getOptionProps: (index, userProps) => {
      const props = userProps ?? ({} as ListboxOptionUserProps);
      const { onClick, ...restUserProps } = props;

      return {
        ...restUserProps,
        id: getRequiredOptionId(options, index),
        role: "option",
        "aria-selected": index === options.selectedIndex,
        "aria-disabled": isOptionDisabled(index) ? true : undefined,
        onClick: (event) => {
          onClick?.(event);

          if (event?.defaultPrevented === true) {
            return;
          }

          selectOption(index);
        }
      } as Omit<NonNullable<typeof userProps>, keyof ListboxOptionProps> & ListboxOptionProps;
    }
  };
}

function getRequiredOptionId<TOption>(
  options: CreateListboxA11yOptions<TOption>,
  index: number
): string {
  const option = options.options[index];
  if (option === undefined) {
    return "";
  }

  return options.getOptionId(option, index);
}
