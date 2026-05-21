import { useId, useMemo } from "react";
import {
  createComboboxA11y,
  type ComboboxA11y,
  type CreateComboboxA11yOptions
} from "../combobox";
import {
  createListboxA11y,
  type CreateListboxA11yOptions,
  type ListboxA11y
} from "../listbox";

/**
 * Options for {@link useListboxA11y}.
 *
 * The `id` field is optional for React consumers. When it is omitted, the hook
 * generates a stable accessibility id with React's `useId`.
 *
 * @example
 * ```tsx
 * const listbox = useListboxA11y({
 *   options: [{ id: "small", label: "Small" }],
 *   activeIndex: 0,
 *   selectedIndex: -1,
 *   getOptionId: (option) => option.id
 * });
 * ```
 */
export interface UseListboxA11yOptions<TOption>
  extends Omit<CreateListboxA11yOptions<TOption>, "id"> {
  /** DOM id for the listbox root. Generated with `useId` when omitted. */
  id?: string;
}

/**
 * Options for {@link useComboboxA11y}.
 *
 * The `id` and `listboxId` fields are optional for React consumers. When `id`
 * is omitted, the hook generates a stable input id with React's `useId`. When
 * `listboxId` is omitted, the hook derives one by appending `-listbox`.
 *
 * @example
 * ```tsx
 * const combobox = useComboboxA11y({
 *   options: [{ id: "red", label: "Red" }],
 *   isOpen: true,
 *   activeIndex: 0,
 *   getOptionId: (option) => option.id
 * });
 * ```
 */
export interface UseComboboxA11yOptions<TOption>
  extends Omit<CreateComboboxA11yOptions<TOption>, "id" | "listboxId"> {
  /** DOM id for the combobox input. Generated with `useId` when omitted. */
  id?: string;
  /** DOM id for the associated listbox. Derived from `id` when omitted. */
  listboxId?: string;
}

/**
 * React hook adapter for {@link createListboxA11y}.
 *
 * @example
 * ```tsx
 * const { getRootProps, getOptionProps } = useListboxA11y({
 *   options,
 *   activeIndex,
 *   selectedIndex,
 *   getOptionId: (option) => option.id
 * });
 * ```
 */
export function useListboxA11y<TOption>(
  options: UseListboxA11yOptions<TOption>
): ListboxA11y<TOption> {
  const generatedId = useId();
  const resolvedId = options.id ?? generatedId;

  return useMemo(
    () =>
      createListboxA11y({
        ...options,
        id: resolvedId
      }),
    [options, resolvedId]
  );
}

/**
 * React hook adapter for {@link createComboboxA11y}.
 *
 * @example
 * ```tsx
 * const { getInputProps, getListboxProps, getOptionProps } = useComboboxA11y({
 *   options,
 *   isOpen,
 *   activeIndex,
 *   getOptionId: (option) => option.id
 * });
 * ```
 */
export function useComboboxA11y<TOption>(
  options: UseComboboxA11yOptions<TOption>
): ComboboxA11y<TOption> {
  const generatedId = useId();
  const resolvedId = options.id ?? generatedId;
  const resolvedListboxId = options.listboxId ?? `${resolvedId}-listbox`;

  return useMemo(
    () =>
      createComboboxA11y({
        ...options,
        id: resolvedId,
        listboxId: resolvedListboxId
      }),
    [options, resolvedId, resolvedListboxId]
  );
}
