import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { useComboboxA11y, useListboxA11y } from "../../src/react";

const options = [
  { id: "one", label: "One" },
  { id: "two", label: "Two" }
] as const;

function captureHookResult<T>(useHook: () => T): { markup: string; value: T } {
  let value: T | undefined;

  function Capture(): null {
    value = useHook();
    return null;
  }

  const markup = renderToStaticMarkup(createElement(Capture));

  if (value === undefined) {
    throw new Error("Hook result was not captured");
  }

  return { markup, value };
}

describe("React a11y hooks", () => {
  it("useListboxA11y returns prop getters without rendering UI", () => {
    const { markup, value } = captureHookResult(() =>
      useListboxA11y({
        id: "numbers",
        options,
        activeIndex: 0,
        selectedIndex: -1,
        getOptionId: (option) => option.id
      })
    );

    expect(markup).toBe("");
    expect(value.getRootProps()).toHaveProperty("role", "listbox");
    expect(value.getOptionProps(0)).toMatchObject({
      id: "one",
      role: "option"
    });
  });

  it("useComboboxA11y returns prop getters and keeps combobox role on the input", () => {
    const { value } = captureHookResult(() =>
      useComboboxA11y({
        id: "numbers",
        options,
        isOpen: true,
        activeIndex: 1,
        getOptionId: (option) => option.id
      })
    );

    expect(value.getInputProps()).toHaveProperty("role", "combobox");
    expect(value.getRootProps()).not.toHaveProperty("role");
    expect(value.getInputProps()).toHaveProperty("aria-activedescendant", "two");
  });

  it("generates stable ids when ids are omitted", () => {
    const first = captureHookResult(() =>
      useComboboxA11y({
        options,
        isOpen: true,
        activeIndex: 0,
        getOptionId: (option) => option.id
      })
    );
    const second = captureHookResult(() =>
      useComboboxA11y({
        options,
        isOpen: true,
        activeIndex: 0,
        getOptionId: (option) => option.id
      })
    );

    expect(first.value.getInputProps().id).toBeTruthy();
    expect(first.value.getListboxProps().id).toBeTruthy();
    expect(second.value.getInputProps().id).toBeTruthy();
    expect(second.value.getListboxProps().id).toBeTruthy();
  });

  it("returns generated metadata ids from hook helpers", () => {
    const listbox = captureHookResult(() =>
      useListboxA11y({
        options,
        activeIndex: 0,
        selectedIndex: -1,
        getOptionId: (option) => option.id
      })
    );
    const combobox = captureHookResult(() =>
      useComboboxA11y({
        options,
        isOpen: true,
        activeIndex: 0,
        getOptionId: (option) => option.id
      })
    );

    expect(listbox.value.ids.root).toBe(listbox.value.getRootProps().id);
    expect(combobox.value.ids.input).toBe(combobox.value.getInputProps().id);
    expect(combobox.value.ids.listbox).toBe(combobox.value.getListboxProps().id);
  });
});
