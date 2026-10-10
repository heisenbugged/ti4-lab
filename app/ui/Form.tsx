import { forwardRef, useId, useRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes, type MouseEvent } from "react";
import { Field as BaseField } from "@base-ui/react/field";
import { Select as BaseSelect } from "@base-ui/react/select";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Toggle } from "@base-ui/react/toggle";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { IconAlertTriangle, IconCheck, IconChevronDown, IconMinus, IconPlus, IconSelector } from "@tabler/icons-react";
import { cx } from "./utils";
import classes from "./Form.module.css";

/* ── Field wrapper ──────────────────────────────────────────────── */

type FieldBits = { label?: ReactNode; hint?: ReactNode; error?: ReactNode; required?: boolean; className?: string };

export function Field({ label, hint, error, children, className, id }: FieldBits & { children: ReactNode; id?: string }) {
  return (
    <BaseField.Root className={cx(classes.field, className)} invalid={!!error}>
      {label && (
        <BaseField.Label className={classes.label} htmlFor={id}>
          {label}
        </BaseField.Label>
      )}
      <div className={classes.control}>{children}</div>
      {error ? (
        <div className={classes.error}>
          <IconAlertTriangle size={14} />
          <span>{error}</span>
        </div>
      ) : hint ? (
        <BaseField.Description className={classes.hint}>{hint}</BaseField.Description>
      ) : null}
    </BaseField.Root>
  );
}

/* ── Text inputs ────────────────────────────────────────────────── */

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> &
  FieldBits & {
    size?: "sm" | "md";
    /** Icon inside the start of the field. */
    leftIcon?: ReactNode;
    /** Content inside the end of the field (a button, a unit). */
    right?: ReactNode;
    /** Colour bar on the left edge, e.g. a player colour. */
    accent?: string;
  };

export const TextInput = forwardRef<HTMLInputElement, InputProps>(function TextInput(
  { label, hint, error, size = "md", leftIcon, right, accent, className, style, ...rest },
  ref,
) {
  const input = (
    <div className={cx(classes.inputWrap, className)} style={accent ? ({ "--accent": accent, ...style } as React.CSSProperties) : style}>
      {accent && <i className={classes.accent} />}
      {leftIcon && <span className={classes.leftIcon}>{leftIcon}</span>}
      <BaseField.Control
        ref={ref}
        className={cx(classes.input, size === "sm" && classes.inputSm, !!leftIcon && classes.withLeft, !!right && classes.withRight, !!accent && classes.withAccent)}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      {right && <span className={classes.right}>{right}</span>}
    </div>
  );
  if (!label && !hint && !error) return <BaseField.Root className={classes.bare}>{input}</BaseField.Root>;
  return (
    <Field label={label} hint={hint} error={error}>
      {input}
    </Field>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldBits & { mono?: boolean }>(function Textarea(
  { label, hint, error, mono, className, ...rest },
  ref,
) {
  const control = (
    <BaseField.Control
      render={<textarea ref={ref} />}
      className={cx(classes.input, classes.textarea, mono && classes.mono, className)}
      aria-invalid={error ? true : undefined}
      {...(rest as object)}
    />
  );
  if (!label && !hint && !error) return <BaseField.Root className={classes.bare}>{control}</BaseField.Root>;
  return (
    <Field label={label} hint={hint} error={error}>
      {control}
    </Field>
  );
});

/* ── Select ─────────────────────────────────────────────────────── */

export type Option<V extends string = string> = { value: V; label: ReactNode; disabled?: boolean; /** Shorter label shown in a MultiSelect trigger. */ short?: ReactNode };

type SelectProps<V extends string> = FieldBits & {
  options: Option<V>[];
  value?: V | null;
  defaultValue?: V;
  onChange?: (value: V) => void;
  placeholder?: string;
  size?: "sm" | "md";
  disabled?: boolean;
  "aria-label"?: string;
  width?: number | string;
};

export function Select<V extends string = string>({ label, hint, error, options, value, defaultValue, onChange, placeholder = "Choose…", size = "md", disabled, width, className, ...rest }: SelectProps<V>) {
  const control = (
    <BaseSelect.Root
      items={options}
      value={value === undefined ? undefined : value}
      defaultValue={defaultValue}
      onValueChange={(v) => v !== null && onChange?.(v as V)}
      disabled={disabled}
    >
      <BaseSelect.Trigger className={cx(classes.input, classes.selectTrigger, size === "sm" && classes.inputSm, className)} aria-label={rest["aria-label"]} style={{ width }}>
        <BaseSelect.Value className={classes.selectValue} placeholder={placeholder} />
        <BaseSelect.Icon className={classes.selectIcon}>
          <IconChevronDown size={15} />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <SelectPopup options={options} />
    </BaseSelect.Root>
  );
  if (!label && !hint && !error) return control;
  return (
    <Field label={label} hint={hint} error={error}>
      {control}
    </Field>
  );
}

function SelectPopup({ options }: { options: Option[] }) {
  return (
    <BaseSelect.Portal>
      <BaseSelect.Positioner className={classes.positioner} sideOffset={4} alignItemWithTrigger={false}>
        <BaseSelect.Popup className={classes.menuPopup}>
          <BaseSelect.List className={classes.menuList}>
            {options.map((o) => (
              <BaseSelect.Item key={o.value} value={o.value} disabled={o.disabled} className={classes.option}>
                <BaseSelect.ItemIndicator className={classes.optionCheck}>
                  <IconCheck size={14} />
                </BaseSelect.ItemIndicator>
                <BaseSelect.ItemText>{o.label}</BaseSelect.ItemText>
              </BaseSelect.Item>
            ))}
          </BaseSelect.List>
        </BaseSelect.Popup>
      </BaseSelect.Positioner>
    </BaseSelect.Portal>
  );
}

/** Select with several values. Shows the chosen labels joined, or a count when long. */
export function MultiSelect<V extends string = string>({
  label,
  hint,
  error,
  options,
  value,
  onChange,
  placeholder = "None",
  size = "md",
  width,
  ...rest
}: FieldBits & { options: Option<V>[]; value: V[]; onChange: (v: V[]) => void; placeholder?: string; size?: "sm" | "md"; width?: number | string; "aria-label"?: string }) {
  const control = (
    <BaseSelect.Root multiple items={options} value={value} onValueChange={(v) => onChange((v ?? []) as V[])}>
      <BaseSelect.Trigger className={cx(classes.input, classes.selectTrigger, size === "sm" && classes.inputSm)} aria-label={rest["aria-label"]} style={{ width }}>
        <BaseSelect.Value className={classes.selectValue}>
          {(vals: V[]) =>
            !vals?.length ? (
              <span className={classes.placeholder}>{placeholder}</span>
            ) : (
              <span className={classes.chipsInline}>
                {vals.map((v) => (
                  <i key={v}>{(() => { const o = options.find((x) => x.value === v); return o?.short ?? o?.label ?? v; })()}</i>
                ))}
              </span>
            )
          }
        </BaseSelect.Value>
        <BaseSelect.Icon className={classes.selectIcon}>
          <IconSelector size={15} />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <SelectPopup options={options} />
    </BaseSelect.Root>
  );
  if (!label && !hint && !error) return control;
  return (
    <Field label={label} hint={hint} error={error}>
      {control}
    </Field>
  );
}

/* ── Checkbox, switch, radio ────────────────────────────────────── */

type CheckProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: ReactNode;
  description?: ReactNode;
  "aria-label"?: string;
  className?: string;
  indeterminate?: boolean;
};

export function Checkbox({ checked, defaultChecked, onChange, disabled, label, description, className, indeterminate, ...rest }: CheckProps) {
  const id = useId();
  return (
    <label className={cx(classes.check, disabled && classes.disabled, className)} htmlFor={id}>
      <BaseCheckbox.Root
        id={id}
        className={classes.box}
        checked={checked}
        defaultChecked={defaultChecked}
        indeterminate={indeterminate}
        onCheckedChange={(c) => onChange?.(c)}
        disabled={disabled}
        aria-label={rest["aria-label"]}
      >
        <BaseCheckbox.Indicator className={classes.boxMark}>{indeterminate ? <IconMinus size={12} stroke={3} /> : <IconCheck size={12} stroke={3} />}</BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
      {(label || description) && (
        <span className={classes.checkText}>
          {label}
          {description && <small>{description}</small>}
        </span>
      )}
    </label>
  );
}

export function Switch({ checked, defaultChecked, onChange, disabled, label, description, className, ...rest }: CheckProps) {
  const id = useId();
  return (
    <label className={cx(classes.check, disabled && classes.disabled, className)} htmlFor={id}>
      <BaseSwitch.Root
        id={id}
        className={classes.switch}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(c) => onChange?.(c)}
        disabled={disabled}
        aria-label={rest["aria-label"] ?? (typeof label === "string" ? label : undefined)}
      >
        <BaseSwitch.Thumb className={classes.thumb} />
      </BaseSwitch.Root>
      {(label || description) && (
        <span className={classes.checkText}>
          {label}
          {description && <small>{description}</small>}
        </span>
      )}
    </label>
  );
}

export function RadioGroup<V extends string>({
  value,
  onChange,
  options,
  label,
  layout = "list",
  className,
}: {
  value: V;
  onChange: (v: V) => void;
  options: Array<Option<V> & { description?: ReactNode; icon?: ReactNode }>;
  label?: string;
  /** list: radio dots · cards: selectable cards in a grid */
  layout?: "list" | "cards";
  className?: string;
}) {
  return (
    <BaseRadioGroup aria-label={label} value={value} onValueChange={(v) => onChange(v as V)} className={cx(layout === "cards" ? classes.radioCards : classes.radioList, className)}>
      {options.map((o) =>
        layout === "cards" ? (
          <BaseRadio.Root key={o.value} value={o.value} disabled={o.disabled} className={classes.radioCard}>
            {o.icon && <span className={classes.radioCardIcon}>{o.icon}</span>}
            <b>{o.label}</b>
            {o.description && <span>{o.description}</span>}
          </BaseRadio.Root>
        ) : (
          <label key={o.value} className={classes.check}>
            <BaseRadio.Root value={o.value} disabled={o.disabled} className={classes.radio}>
              <BaseRadio.Indicator className={classes.radioDot} />
            </BaseRadio.Root>
            <span className={classes.checkText}>
              {o.label}
              {o.description && <small>{o.description}</small>}
            </span>
          </label>
        ),
      )}
    </BaseRadioGroup>
  );
}

/* ── Segmented ──────────────────────────────────────────────────── */

/** A setting with 2–6 short options. The selected one rises and takes a gold underline. */
export function Segmented<V extends string>({
  value,
  onChange,
  options,
  label,
  block,
  size = "md",
  className,
}: {
  value: V;
  onChange: (v: V) => void;
  options: Array<Option<V> & { title?: string }>;
  label: string;
  block?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <ToggleGroup
      aria-label={label}
      value={[value]}
      onValueChange={(v) => v[0] !== undefined && onChange(v[0] as V)}
      className={cx(classes.seg, block && classes.segBlock, size === "sm" && classes.segSm, className)}
    >
      {options.map((o) => (
        <Toggle key={o.value} value={o.value} disabled={o.disabled} className={classes.segOpt} title={o.title}>
          {o.label}
        </Toggle>
      ))}
    </ToggleGroup>
  );
}

/** A filter chip that toggles on and off. */
export function Chip({ pressed, onChange, children, icon, className }: { pressed: boolean; onChange: (p: boolean) => void; children: ReactNode; icon?: ReactNode; className?: string }) {
  return (
    <Toggle pressed={pressed} onPressedChange={onChange} className={cx(classes.chip, className)}>
      {icon}
      {children}
    </Toggle>
  );
}

/* ── Number stepper ─────────────────────────────────────────────── */

// Steppers act on mousedown so rapid clicking feels immediate. Keyboard activation only fires click (detail 0).
function pressHandlers(handler: (e: MouseEvent<HTMLButtonElement>) => void) {
  return {
    onMouseDown: (e: MouseEvent<HTMLButtonElement>) => {
      if (e.button === 0) handler(e);
    },
    onClick: (e: MouseEvent<HTMLButtonElement>) => {
      if (e.detail === 0) handler(e);
    },
  };
}

/** − value + control for small bounded counts. */
export function NumberStepper({
  value,
  decrease,
  increase,
  decreaseDisabled,
  increaseDisabled,
  label,
  size = "md",
  display,
}: {
  value?: number;
  decrease: (e: MouseEvent<HTMLButtonElement>) => void;
  increase: (e: MouseEvent<HTMLButtonElement>) => void;
  decreaseDisabled?: boolean;
  increaseDisabled?: boolean;
  /** What is being counted, for screen readers, e.g. "factions in pool". */
  label?: string;
  size?: "sm" | "md";
  /** Custom text in place of the number (e.g. "off", "3 rings"). */
  display?: ReactNode;
}) {
  // Tick the number in the direction it moved, only after the first change.
  const shown = display ?? value;
  const prev = useRef(shown);
  const ticked = useRef(false);
  const dir = useRef(1);
  if (prev.current !== shown) {
    ticked.current = true;
    if (typeof shown === "number" && typeof prev.current === "number") dir.current = shown > prev.current ? 1 : -1;
    prev.current = shown;
  }
  return (
    <div className={cx(classes.stepper, size === "sm" && classes.stepperSm)} role="group" aria-label={label}>
      <button type="button" className={classes.stepBtn} disabled={decreaseDisabled} aria-label={label ? `Fewer ${label}` : "Decrease"} {...pressHandlers(decrease)}>
        <IconMinus size={14} />
      </button>
      {(value !== undefined || display !== undefined) && (
        <output className={cx(classes.stepVal, display !== undefined && typeof display !== "number" && classes.stepText)} aria-live="polite">
          {/* Re-keyed on change so the new value ticks in (not on first render). */}
          <span
            key={String(shown)}
            className={ticked.current ? classes.tick : undefined}
            style={{ "--tick-from": `${dir.current * 6}px` } as React.CSSProperties}
          >
            {display ?? value}
          </span>
        </output>
      )}
      <button type="button" className={classes.stepBtn} disabled={increaseDisabled} aria-label={label ? `More ${label}` : "Increase"} {...pressHandlers(increase)}>
        <IconPlus size={14} />
      </button>
    </div>
  );
}

/** Typed number input with steppers, for values that need free entry. */
export function NumberField({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  hint,
  error,
  size = "md",
  width,
  format,
  ...rest
}: FieldBits & { value: number | null; onChange: (v: number | null) => void; min?: number; max?: number; step?: number; size?: "sm" | "md"; width?: number; format?: Intl.NumberFormatOptions; "aria-label"?: string }) {
  const control = (
    <BaseNumberField.Root value={value} onValueChange={(v) => onChange(v)} min={min} max={max} step={step} format={format} className={classes.nfRoot}>
      <BaseNumberField.Group className={cx(classes.stepper, size === "sm" && classes.stepperSm)} style={{ width }}>
        <BaseNumberField.Decrement className={classes.stepBtn} aria-label="Decrease">
          <IconMinus size={14} />
        </BaseNumberField.Decrement>
        <BaseNumberField.Input className={classes.nfInput} aria-label={rest["aria-label"]} />
        <BaseNumberField.Increment className={classes.stepBtn} aria-label="Increase">
          <IconPlus size={14} />
        </BaseNumberField.Increment>
      </BaseNumberField.Group>
    </BaseNumberField.Root>
  );
  if (!label && !hint && !error) return control;
  return (
    <Field label={label} hint={hint} error={error}>
      {control}
    </Field>
  );
}

/* ── Slider ─────────────────────────────────────────────────────── */

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  className,
}: {
  value: number | number[];
  onChange: (v: number | number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  className?: string;
}) {
  const vals = Array.isArray(value) ? value : [value];
  return (
    <BaseSlider.Root value={value} onValueChange={(v) => onChange(v as number | number[])} min={min} max={max} step={step} className={cx(classes.slider, className)} aria-label={label}>
      <BaseSlider.Control className={classes.sliderControl}>
        <BaseSlider.Track className={classes.sliderTrack}>
          <BaseSlider.Indicator className={classes.sliderFill} />
          {vals.map((_, i) => (
            <BaseSlider.Thumb key={i} index={i} className={classes.sliderThumb} aria-label={label} />
          ))}
        </BaseSlider.Track>
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
