import { getKeyboardNavigationResult } from "../keyboard";
import type { A11yClickEvent, A11yKeyboardEvent } from "../types";

/**
 * Options for {@link createComboboxA11y}.
 *
 * @example
 * ```ts
 * const options: CreateComboboxA11yOptions<{ id: string; label: string }> = {
 *   id: "color",
 *   listboxId: "color-listbox",
 *   options: [{ id: "red", label: "Red" }],
 *   isOpen: false,
 *   activeIndex: -1,
 *   getOptionId: (option) => option.id
 * };
 * ```
 */
export interface CreateComboboxA11yOptions<TOption> {
  /** DOM id for the combobox input. */
  id: string;
  /** DOM id for the associated listbox. */
  listboxId: string;
  /** Consumer-owned option data. */
  options: readonly TOption[];
  /** Whether the popup listbox is open. */
  isOpen: boolean;
  /** Current active option index, or -1 when none is active. */
  activeIndex: number;
  /** Maps an option to its DOM id. */
  getOptionId: (option: TOption, index: number) => string;
  /** Returns true when an option cannot be selected or activated. */
  isOptionDisabled?: (option: TOption, index: number) => boolean;
  /** Called when keyboard behavior requests opening or closing the popup. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Called when keyboard navigation requests a new active index. */
  onActiveIndexChange?: (index: number) => void;
  /** Called when an enabled option is selected. */
  onSelect?: (option: TOption, index: number) => void;
  /** Enables wrapping keyboard movement. */
  loop?: boolean;
  /** Called when a newly active option should be scrolled into view by the consumer. */
  onActiveOptionScrollRequest?: (index: number) => void;
  /** Marks the input as disabled. */
  disabled?: boolean;
}

/**
 * Root props returned by {@link createComboboxA11y}.
 *
 * @example
 * ```ts
 * const rootProps: ComboboxRootProps = {};
 * ```
 */
export interface ComboboxRootProps {
  id?: string;
}

/**
 * Consumer props accepted by {@link ComboboxA11y.getRootProps}.
 */
export interface ComboboxRootUserProps {
  [prop: string]: unknown;
}

/**
 * Input props returned by {@link createComboboxA11y}.
 *
 * @example
 * ```ts
 * const inputProps: ComboboxInputProps = {
 *   id: "color",
 *   role: "combobox",
 *   "aria-autocomplete": "list",
 *   "aria-expanded": false,
 *   "aria-controls": "color-listbox",
 *   autoComplete: "off"
 * };
 * ```
 */
export interface ComboboxInputProps {
  id: string;
  role: "combobox";
  "aria-autocomplete": "list";
  "aria-expanded": boolean;
  "aria-controls": string;
  "aria-activedescendant"?: string | undefined;
  "aria-disabled"?: boolean | undefined;
  autoComplete: "off";
  onKeyDown?: (event: A11yKeyboardEvent) => void;
}

/**
 * Consumer props accepted by {@link ComboboxA11y.getInputProps}.
 */
export interface ComboboxInputUserProps {
  onKeyDown?: (event: A11yKeyboardEvent) => void;
  [prop: string]: unknown;
}

/**
 * Listbox props returned by {@link createComboboxA11y}.
 *
 * @example
 * ```ts
 * const listboxProps: ComboboxListboxProps = {
 *   id: "color-listbox",
 *   role: "listbox"
 * };
 * ```
 */
export interface ComboboxListboxProps {
  id: string;
  role: "listbox";
}

/**
 * Option props returned by {@link createComboboxA11y}.
 *
 * @example
 * ```ts
 * const optionProps: ComboboxOptionProps = {
 *   id: "red",
 *   role: "option",
 *   "aria-selected": true,
 *   "aria-disabled": undefined
 * };
 * ```
 */
export interface ComboboxOptionProps {
  id: string;
  role: "option";
  "aria-selected": boolean;
  "aria-disabled": boolean | undefined;
  onClick?: (event?: A11yClickEvent) => void;
}

/**
 * Consumer props accepted by {@link ComboboxA11y.getOptionProps}.
 */
export interface ComboboxOptionUserProps {
  onClick?: (event?: A11yClickEvent) => void;
  [prop: string]: unknown;
}

/**
 * Stable ids used by the combobox helper.
 */
export interface ComboboxA11yIds {
  /** DOM id for the combobox input. */
  input: string;
  /** DOM id for the popup listbox. */
  listbox: string;
}

/**
 * Headless combobox prop getter API.
 *
 * @example
 * ```ts
 * const combobox = createComboboxA11y({
 *   id: "color",
 *   listboxId: "color-listbox",
 *   options: [{ id: "red", label: "Red" }],
 *   isOpen: true,
 *   activeIndex: 0,
 *   getOptionId: (option) => option.id
 * });
 *
 * combobox.getInputProps();
 * ```
 */
export interface ComboboxA11y<TOption> {
  getRootProps: <TUserProps extends ComboboxRootUserProps = ComboboxRootUserProps>(
    userProps?: TUserProps
  ) => Omit<TUserProps, keyof ComboboxRootProps> & ComboboxRootProps;
  getInputProps: <TUserProps extends ComboboxInputUserProps = ComboboxInputUserProps>(
    userProps?: TUserProps
  ) => Omit<TUserProps, keyof ComboboxInputProps> & ComboboxInputProps;
  getListboxProps: () => ComboboxListboxProps;
  getOptionProps: <TUserProps extends ComboboxOptionUserProps = ComboboxOptionUserProps>(
    index: number,
    userProps?: TUserProps
  ) => Omit<TUserProps, keyof ComboboxOptionProps> & ComboboxOptionProps;
  readonly ids: ComboboxA11yIds;
  readonly options: readonly TOption[];
}

/**
 * Creates headless ARIA props and event handlers for a controlled combobox.
 *
 * @example
 * ```ts
 * const combobox = createComboboxA11y({
 *   id: "color",
 *   listboxId: "color-listbox",
 *   options: [{ id: "red", label: "Red" }],
 *   isOpen: false,
 *   activeIndex: -1,
 *   getOptionId: (option) => option.id,
 *   onOpenChange: (isOpen) => console.log(isOpen)
 * });
 * ```
 */
export function createComboboxA11y<TOption>(
  options: CreateComboboxA11yOptions<TOption>
): ComboboxA11y<TOption> {
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

  const requestActiveIndex = (index: number): void => {
    options.onActiveIndexChange?.(index);
    options.onActiveOptionScrollRequest?.(index);
  };

  const selectOption = (index: number): boolean => {
    const option = options.options[index];
    if (option === undefined || isOptionDisabled(index)) {
      return false;
    }

    options.onSelect?.(option, index);
    return true;
  };

  const openAndActivateFirstOption = (): void => {
    options.onOpenChange?.(true);

    const result = getKeyboardNavigationResult({
      key: "Home",
      activeIndex: options.activeIndex,
      itemCount: options.options.length,
      isItemDisabled: isOptionDisabled,
      loop: false
    });

    if (result.action === "move") {
      requestActiveIndex(result.activeIndex);
    }
  };

  return {
    ids: { input: options.id, listbox: options.listboxId },
    options: options.options,
    getRootProps: (userProps) =>
      ({
        ...(userProps ?? ({} as ComboboxRootUserProps))
      }) as Omit<NonNullable<typeof userProps>, keyof ComboboxRootProps> & ComboboxRootProps,
    getInputProps: (userProps) => {
      const props = userProps ?? ({} as ComboboxInputUserProps);
      const { onKeyDown, ...restUserProps } = props;

      return {
        ...restUserProps,
        id: options.id,
        role: "combobox",
        "aria-autocomplete": "list",
        "aria-expanded": options.isOpen,
        "aria-controls": options.listboxId,
        "aria-activedescendant": getActiveOptionId(),
        "aria-disabled": options.disabled === true ? true : undefined,
        autoComplete: "off",
        onKeyDown: (event) => {
          onKeyDown?.(event);

          if (event.defaultPrevented === true) {
            return;
          }

          if (event.key === "ArrowDown" && !options.isOpen) {
            event.preventDefault?.();
            openAndActivateFirstOption();
            return;
          }

          const result = getKeyboardNavigationResult({
            key: event.key,
            activeIndex: options.activeIndex,
            itemCount: options.options.length,
            isItemDisabled: isOptionDisabled,
            loop: options.loop === true
          });

          if (result.action === "escape") {
            event.preventDefault?.();
            options.onOpenChange?.(false);
            return;
          }

          if (result.action === "move") {
            event.preventDefault?.();
            if (!options.isOpen) {
              options.onOpenChange?.(true);
            }
            requestActiveIndex(result.activeIndex);
            return;
          }

          if (result.action === "select" && selectOption(options.activeIndex)) {
            event.preventDefault?.();
          }
        }
      } as Omit<NonNullable<typeof userProps>, keyof ComboboxInputProps> & ComboboxInputProps;
    },
    getListboxProps: () => ({
      id: options.listboxId,
      role: "listbox"
    }),
    getOptionProps: (index, userProps) => {
      const props = userProps ?? ({} as ComboboxOptionUserProps);
      const { onClick, ...restUserProps } = props;

      return {
        ...restUserProps,
        id: getRequiredOptionId(options, index),
        role: "option",
        "aria-selected": index === options.activeIndex,
        "aria-disabled": isOptionDisabled(index) ? true : undefined,
        onClick: (event) => {
          onClick?.(event);

          if (event?.defaultPrevented === true) {
            return;
          }

          selectOption(index);
        }
      } as Omit<NonNullable<typeof userProps>, keyof ComboboxOptionProps> & ComboboxOptionProps;
    }
  };
}

function getRequiredOptionId<TOption>(
  options: CreateComboboxA11yOptions<TOption>,
  index: number
): string {
  const option = options.options[index];
  if (option === undefined) {
    return "";
  }

  return options.getOptionId(option, index);
}
