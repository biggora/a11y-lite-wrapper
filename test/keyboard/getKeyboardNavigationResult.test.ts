import { describe, expect, it } from "vitest";
import { getKeyboardNavigationResult } from "../../src";

interface TestItem {
  readonly id: string;
  readonly disabled?: true;
}

const items = [
  { id: "alpha" },
  { id: "bravo", disabled: true },
  { id: "charlie" }
] satisfies readonly TestItem[];

describe("getKeyboardNavigationResult", () => {
  it("keeps no active item for arrow keys when the item list is empty", () => {
    const result = getKeyboardNavigationResult({
      key: "ArrowDown",
      activeIndex: -1,
      itemCount: 0,
      isItemDisabled: () => false,
      loop: true
    });

    expect(result).toMatchObject({
      activeIndex: -1,
      action: "none",
      shouldPreventDefault: false
    });
  });

  it("skips disabled items when moving down", () => {
    const result = getKeyboardNavigationResult({
      key: "ArrowDown",
      activeIndex: 0,
      itemCount: items.length,
      isItemDisabled: (index) => items[index]?.disabled === true,
      loop: true
    });

    expect(result.activeIndex).toBe(2);
    expect(result.action).toBe("move");
    expect(result.shouldPreventDefault).toBe(true);
  });

  it("wraps from the last enabled item to the first enabled item when loop is enabled", () => {
    const result = getKeyboardNavigationResult({
      key: "ArrowDown",
      activeIndex: 2,
      itemCount: items.length,
      isItemDisabled: (index) => items[index]?.disabled === true,
      loop: true
    });

    expect(result.activeIndex).toBe(0);
  });

  it("does not move past the last enabled item when loop is disabled", () => {
    const result = getKeyboardNavigationResult({
      key: "ArrowDown",
      activeIndex: 2,
      itemCount: items.length,
      isItemDisabled: (index) => items[index]?.disabled === true,
      loop: false
    });

    expect(result.activeIndex).toBe(2);
    expect(result.action).toBe("none");
  });

  it("moves to the first and last enabled items with Home and End", () => {
    const home = getKeyboardNavigationResult({
      key: "Home",
      activeIndex: 2,
      itemCount: items.length,
      isItemDisabled: (index) => items[index]?.disabled === true,
      loop: false
    });
    const end = getKeyboardNavigationResult({
      key: "End",
      activeIndex: 0,
      itemCount: items.length,
      isItemDisabled: (index) => items[index]?.disabled === true,
      loop: false
    });

    expect(home.activeIndex).toBe(0);
    expect(end.activeIndex).toBe(2);
  });

  it("reports Escape, Enter, and Space actions without changing active index", () => {
    const escape = getKeyboardNavigationResult({
      key: "Escape",
      activeIndex: 2,
      itemCount: items.length,
      isItemDisabled: (index) => items[index]?.disabled === true,
      loop: true
    });
    const enter = getKeyboardNavigationResult({
      key: "Enter",
      activeIndex: 2,
      itemCount: items.length,
      isItemDisabled: (index) => items[index]?.disabled === true,
      loop: true
    });
    const space = getKeyboardNavigationResult({
      key: " ",
      activeIndex: 2,
      itemCount: items.length,
      isItemDisabled: (index) => items[index]?.disabled === true,
      loop: true
    });

    expect(escape).toMatchObject({ activeIndex: 2, action: "escape" });
    expect(enter).toMatchObject({ activeIndex: 2, action: "select" });
    expect(space).toMatchObject({ activeIndex: 2, action: "select" });
  });
});
