import { describe, expect, it, vi } from "vitest";
import { createComboboxA11y } from "../../src";

interface TestOption {
  readonly id: string;
  readonly label: string;
  readonly disabled?: true;
}

const options = [
  { id: "red", label: "Red" },
  { id: "green", label: "Green" },
  { id: "blue", label: "Blue", disabled: true }
] satisfies readonly TestOption[];

describe("createComboboxA11y", () => {
  it("puts combobox role on input props only", () => {
    const combobox = createComboboxA11y({
      id: "color",
      listboxId: "color-listbox",
      options,
      isOpen: false,
      activeIndex: -1,
      getOptionId: (option) => option.id,
      isOptionDisabled: (option) => option.disabled === true
    });

    const rootProps = combobox.getRootProps();
    const inputProps = combobox.getInputProps();

    expect(inputProps).toHaveProperty("role", "combobox");
    expect(rootProps).not.toHaveProperty("role");
  });

  it("returns input props for expanded state, controls, and active descendant", () => {
    const combobox = createComboboxA11y({
      id: "color",
      listboxId: "color-listbox",
      options,
      isOpen: true,
      activeIndex: 1,
      getOptionId: (option) => option.id,
      isOptionDisabled: (option) => option.disabled === true
    });

    expect(combobox.getInputProps()).toMatchObject({
      id: "color",
      role: "combobox",
      "aria-expanded": true,
      "aria-controls": "color-listbox",
      "aria-activedescendant": "green"
    });
  });

  it("opens on ArrowDown and closes on Escape", () => {
    const onOpenChange = vi.fn();
    const combobox = createComboboxA11y({
      id: "color",
      listboxId: "color-listbox",
      options,
      isOpen: false,
      activeIndex: -1,
      getOptionId: (option) => option.id,
      isOptionDisabled: (option) => option.disabled === true,
      onOpenChange
    });
    const inputProps = combobox.getInputProps();

    inputProps.onKeyDown?.({ key: "ArrowDown", preventDefault: vi.fn() });
    inputProps.onKeyDown?.({ key: "Escape", preventDefault: vi.fn() });

    expect(onOpenChange).toHaveBeenNthCalledWith(1, true);
    expect(onOpenChange).toHaveBeenNthCalledWith(2, false);
  });

  it("selects the active enabled option with Enter", () => {
    const onSelect = vi.fn();
    const combobox = createComboboxA11y({
      id: "color",
      listboxId: "color-listbox",
      options,
      isOpen: true,
      activeIndex: 1,
      getOptionId: (option) => option.id,
      isOptionDisabled: (option) => option.disabled === true,
      onSelect
    });
    const event = { key: "Enter", preventDefault: vi.fn() };

    combobox.getInputProps().onKeyDown?.(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledWith(options[1], 1);
  });

  it("returns listbox and option props without moving focus to options", () => {
    const combobox = createComboboxA11y({
      id: "color",
      listboxId: "color-listbox",
      options,
      isOpen: true,
      activeIndex: 0,
      getOptionId: (option) => option.id,
      isOptionDisabled: (option) => option.disabled === true
    });

    expect(combobox.getListboxProps()).toMatchObject({
      id: "color-listbox",
      role: "listbox"
    });
    expect(combobox.getOptionProps(0)).toMatchObject({
      id: "red",
      role: "option",
      "aria-selected": true
    });
    expect(combobox.getOptionProps(0)).not.toHaveProperty("tabIndex", 0);
  });

  it("merges root props without adding a root role", () => {
    const combobox = createComboboxA11y({
      id: "color",
      listboxId: "color-listbox",
      options,
      isOpen: false,
      activeIndex: -1,
      getOptionId: (option) => option.id
    });

    expect(combobox.getRootProps({ id: "wrapper", "aria-label": "Color" })).toEqual({
      id: "wrapper",
      "aria-label": "Color"
    });
    expect(combobox.getRootProps()).not.toHaveProperty("role");
  });

  it("composes input key handlers and skips internal behavior when consumer prevents default", () => {
    const onOpenChange = vi.fn();
    const calls: string[] = [];
    const combobox = createComboboxA11y({
      id: "color",
      listboxId: "color-listbox",
      options,
      isOpen: false,
      activeIndex: -1,
      getOptionId: (option) => option.id,
      onOpenChange: (isOpen) => {
        calls.push(`internal:${isOpen}`);
        onOpenChange(isOpen);
      }
    });
    const event = {
      key: "ArrowDown",
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      }
    };

    const inputProps = combobox.getInputProps({
      placeholder: "Color",
      onKeyDown: (consumerEvent) => {
        calls.push("consumer");
        consumerEvent.preventDefault?.();
      }
    });
    inputProps.onKeyDown?.(event);

    expect(inputProps).toMatchObject({ placeholder: "Color" });
    expect(calls).toEqual(["consumer"]);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("composes option click handlers and skips selection when consumer prevents default", () => {
    const onSelect = vi.fn();
    const calls: string[] = [];
    const combobox = createComboboxA11y({
      id: "color",
      listboxId: "color-listbox",
      options,
      isOpen: true,
      activeIndex: 0,
      getOptionId: (option) => option.id,
      onSelect: (option, index) => {
        calls.push(`internal:${option.id}:${index}`);
        onSelect(option, index);
      }
    });
    const event = {
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      }
    };

    const optionProps = combobox.getOptionProps(1, {
      title: "Green option",
      onClick: (consumerEvent) => {
        calls.push("consumer");
        consumerEvent?.preventDefault?.();
      }
    });
    optionProps.onClick?.(event);

    expect(optionProps).toMatchObject({ title: "Green option" });
    expect(calls).toEqual(["consumer"]);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("exposes input and listbox id metadata", () => {
    const combobox = createComboboxA11y({
      id: "color",
      listboxId: "color-listbox",
      options,
      isOpen: false,
      activeIndex: -1,
      getOptionId: (option) => option.id
    });

    expect(combobox.ids).toEqual({ input: "color", listbox: "color-listbox" });
  });
});
