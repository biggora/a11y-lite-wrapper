[![npm version](https://img.shields.io/npm/v/a11y-lite-wrapper.svg)](https://www.npmjs.com/package/a11y-lite-wrapper)
[![CI](https://img.shields.io/github/actions/workflow/status/biggora/a11y-lite-wrapper/ci.yml?branch=main)](https://github.com/biggora/a11y-lite-wrapper/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# a11y-lite-wrapper

Zero-dependency headless WAI-ARIA helpers for keyboard navigation, listbox, and combobox widgets.

`a11y-lite-wrapper` does not render elements, ship styles, move DOM focus between options, or install global listeners. It returns prop getters and event handlers that you spread onto your own markup.

## Demo

[demo page](https://biggora.github.io/a11y-lite-wrapper/?target=_blank)

## Install

```sh
pnpm add a11y-lite-wrapper
```

React is optional. Install it only when you use the React adapter:

```sh
pnpm add react react-dom
```

## Features

- Vanilla TypeScript core for listbox, combobox, and shared keyboard navigation.
- React hooks layered over the same core logic.
- Virtual focus through `aria-activedescendant`.
- User prop merging and event handler composition.
- ESM, CJS, and TypeScript declaration outputs.
- No runtime dependencies.

## Usage

### Combobox Core

```ts
import { createComboboxA11y } from "a11y-lite-wrapper/combobox";

const options = [
  { id: "red", label: "Red" },
  { id: "green", label: "Green" }
];

const combobox = createComboboxA11y({
  id: "color",
  listboxId: "color-listbox",
  options,
  isOpen: true,
  activeIndex: 0,
  getOptionId: (option) => option.id,
  onOpenChange: (isOpen) => {
    console.log("open", isOpen);
  },
  onSelect: (option) => {
    console.log("selected", option.label);
  }
});

const inputProps = combobox.getInputProps();
const listboxProps = combobox.getListboxProps();
const firstOptionProps = combobox.getOptionProps(0);
```

`getInputProps()` is the only getter that adds `role="combobox"`. `getRootProps()` stays role-free so consumers control wrapper markup.

### Listbox Core

```ts
import { createListboxA11y } from "a11y-lite-wrapper/listbox";

const listbox = createListboxA11y({
  id: "size",
  options: [
    { id: "small", label: "Small" },
    { id: "large", label: "Large" }
  ],
  activeIndex: 0,
  selectedIndex: -1,
  getOptionId: (option) => option.id,
  onSelect: (option) => {
    console.log("selected", option.label);
  }
});

const rootProps = listbox.getRootProps();
const optionProps = listbox.getOptionProps(0);
```

### React Adapter

```tsx
import { useComboboxA11y } from "a11y-lite-wrapper/react";

function ColorCombobox() {
  const combobox = useComboboxA11y({
    options: [
      { id: "red", label: "Red" },
      { id: "green", label: "Green" }
    ],
    isOpen: true,
    activeIndex: 0,
    getOptionId: (option) => option.id
  });

  return (
    <div {...combobox.getRootProps()}>
      <input {...combobox.getInputProps()} />
      <ul {...combobox.getListboxProps()}>
        {combobox.options.map((option, index) => (
          <li key={option.id} {...combobox.getOptionProps(index)}>
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

When `id` is omitted, React hooks generate stable accessibility ids with `useId()`. The resolved ids are available through the returned `ids` metadata.

## Event Composition

Prop getters accept optional user props. User event handlers run before internal handlers. If a user handler prevents default, the internal behavior is skipped.

```ts
const inputProps = combobox.getInputProps({
  onKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  }
});
```

## Exports

```ts
import { createComboboxA11y, createListboxA11y } from "a11y-lite-wrapper";
import { getKeyboardNavigationResult } from "a11y-lite-wrapper/keyboard";
import { useComboboxA11y, useListboxA11y } from "a11y-lite-wrapper/react";
```

```ts
import { createComboboxA11y } from "a11y-lite-wrapper/combobox";
import { createListboxA11y } from "a11y-lite-wrapper/listbox";
```

The root entry does not import React. Use `a11y-lite-wrapper/react` for React hooks.

## Development

```sh
pnpm install
pnpm test
pnpm typecheck
pnpm build
pnpm exec publint
```

`pnpm exec attw --pack .` is included in `pnpm lint:package`, but the local tool currently crashes with `Cannot read properties of undefined (reading 'filename')` in this environment. `publint`, tests, type checking, and build pass.

## License

[MIT](LICENSE).
