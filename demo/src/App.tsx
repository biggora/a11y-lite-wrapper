import { useMemo, useState, type ChangeEvent } from "react";
import { useComboboxA11y, useListboxA11y } from "a11y-lite-wrapper/react";

interface DemoOption {
  id: string;
  label: string;
  detail: string;
  disabled?: boolean;
}

interface StateItem {
  label: string;
  value: string;
}

const listboxOptions = [
  {
    id: "quick-audit",
    label: "Quick audit",
    detail: "Fast pass for release notes and critical flows."
  },
  {
    id: "manual-review",
    label: "Manual review",
    detail: "Focused keyboard and screen reader inspection."
  },
  {
    id: "automated-scan",
    label: "Automated scan",
    detail: "Unavailable while the scan runner is offline.",
    disabled: true
  },
  {
    id: "regression-pass",
    label: "Regression pass",
    detail: "Repeatable checks for changed interface surfaces."
  }
] as const satisfies readonly DemoOption[];

const comboboxOptions = [
  {
    id: "contrast-check",
    label: "Contrast check",
    detail: "Measure text and interface contrast ratios."
  },
  {
    id: "keyboard-trap-scan",
    label: "Keyboard trap scan",
    detail: "Find focus paths that cannot be escaped."
  },
  {
    id: "aria-audit",
    label: "ARIA audit",
    detail: "Inspect roles, names, states, and relationships."
  },
  {
    id: "color-token-review",
    label: "Color token review",
    detail: "Unavailable until design tokens are synced.",
    disabled: true
  },
  {
    id: "focus-order-review",
    label: "Focus order review",
    detail: "Check that tab order follows visual and task order."
  }
] as const satisfies readonly DemoOption[];

function App() {
  return <DemoPage />;
}

function DemoPage() {
  const [resetKey, setResetKey] = useState(0);

  return (
    <main className="page-shell">
      <section className="demo-header" aria-labelledby="demo-title">
        <div>
          <p className="eyebrow">React hook demo</p>
          <h1 id="demo-title">a11y-lite-wrapper</h1>
        </div>
        <button
          className="reset-button"
          type="button"
          onClick={() => {
            setResetKey((current) => current + 1);
          }}
        >
          Reset demos
        </button>
      </section>

      <section className="demo-grid" aria-label="Accessibility helper demos">
        <ListboxDemo key={`listbox-${resetKey}`} />
        <ComboboxDemo key={`combobox-${resetKey}`} />
      </section>
    </main>
  );
}

function ListboxDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const listbox = useListboxA11y({
    id: "review-workflow-listbox",
    options: listboxOptions,
    activeIndex,
    selectedIndex,
    getOptionId: getOptionDomId,
    isOptionDisabled,
    loop: true,
    onActiveIndexChange: setActiveIndex,
    onSelect: (_option, index) => {
      setSelectedIndex(index);
      setActiveIndex(index);
    }
  });

  const selectedOption = getOptionAt(listboxOptions, selectedIndex);
  const listboxRootProps = listbox.getRootProps({
    "aria-describedby": "review-workflow-help",
    "aria-labelledby": "review-workflow-label",
    className: "option-list listbox-surface"
  });
  const listboxActiveOptionId = listboxRootProps["aria-activedescendant"];

  return (
    <article className="demo-panel" aria-labelledby="review-workflow-label">
      <div className="panel-heading">
        <div>
          <h2 id="review-workflow-label">Review workflow</h2>
          <p id="review-workflow-help">Use Arrow keys to move. Press Enter or Space to select.</p>
        </div>
        <span className="mode-badge">Listbox</span>
      </div>

      <div {...listboxRootProps}>
        {listboxOptions.map((option, index) => {
          const optionProps = listbox.getOptionProps(index, {
            className: "option-row",
            "data-active": index === activeIndex ? "true" : "false"
          });

          return (
            <div key={option.id} {...optionProps}>
              <OptionContent option={option} />
            </div>
          );
        })}
      </div>

      <StateInspector
        title="Listbox state"
        items={[
          { label: "Active option id", value: formatAriaValue(listboxActiveOptionId) },
          {
            label: "Root aria-activedescendant",
            value: formatAriaValue(listboxRootProps["aria-activedescendant"])
          },
          { label: "Selected", value: formatOptionLabel(selectedOption) },
          { label: "Selected index", value: formatIndex(selectedIndex) }
        ]}
      />
    </article>
  );
}

function ComboboxDemo() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedOption, setSelectedOption] = useState<DemoOption | undefined>();

  const filteredOptions = useMemo(() => filterOptions(comboboxOptions, query), [query]);

  const combobox = useComboboxA11y({
    id: "search-checks-input",
    listboxId: "search-checks-results",
    options: filteredOptions,
    isOpen,
    activeIndex,
    getOptionId: getOptionDomId,
    isOptionDisabled,
    loop: true,
    onOpenChange: setIsOpen,
    onActiveIndexChange: setActiveIndex,
    onSelect: (option) => {
      setSelectedOption(option);
      setQuery(option.label);
      setIsOpen(false);
      setActiveIndex(0);
    }
  });

  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    setQuery(event.target.value);
    setSelectedOption(undefined);
    setIsOpen(true);
    setActiveIndex(-1);
  }

  const comboboxRootProps = combobox.getRootProps({ className: "combobox-wrap" });
  const comboboxInputProps = combobox.getInputProps({
    "aria-describedby": "search-checks-help",
    "aria-labelledby": "search-checks-label",
    className: "combobox-input",
    onChange: handleInputChange,
    placeholder: "Start with aria, focus, contrast...",
    value: query
  });
  const comboboxActiveOptionId = comboboxInputProps["aria-activedescendant"];

  return (
    <article className="demo-panel" aria-labelledby="search-checks-label">
      <div className="panel-heading">
        <div>
          <h2 id="search-checks-label">Search checks</h2>
          <p id="search-checks-help">Type to filter. Arrow Down opens results. Escape closes.</p>
        </div>
        <span className="mode-badge">Combobox</span>
      </div>

      <div {...comboboxRootProps}>
        <input {...comboboxInputProps} />

        {isOpen ? (
          <div className="option-list combobox-results" {...combobox.getListboxProps()}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const optionProps = combobox.getOptionProps(index, {
                  className: "option-row",
                  "data-active": index === activeIndex ? "true" : "false"
                });

                return (
                  <div key={option.id} {...optionProps}>
                    <OptionContent option={option} />
                  </div>
                );
              })
            ) : (
              <div className="empty-results" role="presentation">
                No checks match this query.
              </div>
            )}
          </div>
        ) : null}
      </div>

      <StateInspector
        title="Combobox state"
        items={[
          { label: "Query", value: query.length > 0 ? query : "Empty" },
          { label: "Popup", value: isOpen ? "Open" : "Closed" },
          {
            label: "Input aria-expanded",
            value: formatAriaValue(comboboxInputProps["aria-expanded"])
          },
          { label: "Active option id", value: formatAriaValue(comboboxActiveOptionId) },
          {
            label: "Input aria-activedescendant",
            value: formatAriaValue(comboboxInputProps["aria-activedescendant"])
          },
          { label: "Selected", value: formatOptionLabel(selectedOption) }
        ]}
      />
    </article>
  );
}

function OptionContent({ option }: { option: DemoOption }) {
  return (
    <>
      <span className="option-copy">
        <span className="option-label">{option.label}</span>
        <span className="option-detail">{option.detail}</span>
      </span>
      {option.disabled === true ? <span className="disabled-chip">Disabled</span> : null}
    </>
  );
}

function StateInspector({ title, items }: { title: string; items: readonly StateItem[] }) {
  return (
    <section className="state-inspector" aria-live="polite" aria-label={title}>
      <h3>{title}</h3>
      <dl>
        {items.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function filterOptions(options: readonly DemoOption[], query: string): readonly DemoOption[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  if (normalizedQuery.length === 0) {
    return options;
  }

  return options.filter((option) => {
    const searchableText = `${option.label} ${option.detail}`.toLocaleLowerCase();
    return searchableText.includes(normalizedQuery);
  });
}

function getOptionDomId(option: DemoOption): string {
  return `demo-option-${option.id}`;
}

function isOptionDisabled(option: DemoOption): boolean {
  return option.disabled === true;
}

function getOptionAt(options: readonly DemoOption[], index: number): DemoOption | undefined {
  if (index < 0) {
    return undefined;
  }

  return options[index];
}

function formatOptionLabel(option: DemoOption | undefined): string {
  return option?.label ?? "None";
}

function formatAriaValue(value: string | boolean | undefined): string {
  return value === undefined ? "None" : String(value);
}

function formatIndex(index: number): string {
  return index >= 0 ? String(index) : "None";
}

export default App;
