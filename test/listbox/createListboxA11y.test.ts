import { describe, expect, it, vi } from "vitest";
import { createListboxA11y } from "../../src";

interface TestOption {
  readonly id: string;
  readonly label: string;
  readonly disabled?: true;
}

const options = [
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium", disabled: true },
  { id: "large", label: "Large" }
] satisfies readonly TestOption[];

describe("createListboxA11y", () => {
  it("returns root props with listbox role and active descendant", () => {
    const listbox = createListboxA11y({
      id: "size",
      options,
      activeIndex: 2,
      selectedIndex: 0,
      getOptionId: (option) => option.id,
      isOptionDisabled: (option) => option.disabled === true
    });

    expect(listbox.getRootProps()).toMatchObject({
      id: "size",
      role: "listbox",
      tabIndex: 0,
      "aria-activedescendant": "large"
    });
  });

  it("returns option props with ids, roles, selected state, and disabled state", () => {
    const listbox = createListboxA11y({
      id: "size",
      options,
      activeIndex: 0,
      selectedIndex: 0,
      getOptionId: (option) => option.id,
      isOptionDisabled: (option) => option.disabled === true
    });

    expect(listbox.getOptionProps(0)).toMatchObject({
      id: "small",
      role: "option",
      "aria-selected": true,
      "aria-disabled": undefined
    });
    expect(listbox.getOptionProps(1)).toMatchObject({
      id: "medium",
      role: "option",
      "aria-selected": false,
      "aria-disabled": true
    });
  });

  it("calls the selection callback for enabled option clicks only", () => {
    const onSelect = vi.fn();
    const listbox = createListboxA11y({
      id: "size",
      options,
      activeIndex: 0,
      selectedIndex: -1,
      getOptionId: (option) => option.id,
      isOptionDisabled: (option) => option.disabled === true,
      onSelect
    });

    listbox.getOptionProps(1).onClick?.();
    listbox.getOptionProps(2).onClick?.();

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(options[2], 2);
  });

  it("uses keyboard selection to select the active enabled option", () => {
    const onSelect = vi.fn();
    const listbox = createListboxA11y({
      id: "size",
      options,
      activeIndex: 2,
      selectedIndex: -1,
      getOptionId: (option) => option.id,
      isOptionDisabled: (option) => option.disabled === true,
      onSelect
    });
    const event = { key: "Enter", preventDefault: vi.fn() };

    listbox.getRootProps().onKeyDown?.(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledWith(options[2], 2);
  });

  it("composes root key handlers and skips navigation when consumer prevents default", () => {
    const onActiveIndexChange = vi.fn();
    const calls: string[] = [];
    const listbox = createListboxA11y({
      id: "size",
      options,
      activeIndex: 0,
      selectedIndex: -1,
      getOptionId: (option) => option.id,
      isOptionDisabled: (option) => option.disabled === true,
      onActiveIndexChange: (index) => {
        calls.push(`internal:${index}`);
        onActiveIndexChange(index);
      }
    });
    const event = {
      key: "ArrowDown",
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      }
    };

    const rootProps = listbox.getRootProps({
      "data-testid": "size-listbox",
      onKeyDown: (consumerEvent) => {
        calls.push("consumer");
        consumerEvent.preventDefault?.();
      }
    });
    rootProps.onKeyDown?.(event);

    expect(rootProps).toMatchObject({ "data-testid": "size-listbox" });
    expect(calls).toEqual(["consumer"]);
    expect(onActiveIndexChange).not.toHaveBeenCalled();
  });

  it("composes option click handlers and skips selection when consumer prevents default", () => {
    const onSelect = vi.fn();
    const calls: string[] = [];
    const listbox = createListboxA11y({
      id: "size",
      options,
      activeIndex: 0,
      selectedIndex: -1,
      getOptionId: (option) => option.id,
      isOptionDisabled: (option) => option.disabled === true,
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

    const optionProps = listbox.getOptionProps(2, {
      title: "Large option",
      onClick: (consumerEvent) => {
        calls.push("consumer");
        consumerEvent?.preventDefault?.();
      }
    });
    optionProps.onClick?.(event);

    expect(optionProps).toMatchObject({ title: "Large option" });
    expect(calls).toEqual(["consumer"]);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("exposes listbox id metadata", () => {
    const listbox = createListboxA11y({
      id: "size",
      options,
      activeIndex: 0,
      selectedIndex: -1,
      getOptionId: (option) => option.id
    });

    expect(listbox.ids).toEqual({ root: "size" });
  });
});
