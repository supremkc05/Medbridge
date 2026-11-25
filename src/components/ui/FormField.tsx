import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import styles from "./FormField.module.scss";

interface FieldShellProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

function FieldShell({ id, label, error, hint, required, children }: FieldShellProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className={styles.hint}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: string) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  /** Icon shown inside the input on the left. */
  leading?: ReactNode;
  /** Control shown inside the input on the right, e.g. a show-password button. */
  trailing?: ReactNode;
}

export function TextField({ id, label, error, hint, required, className, leading, trailing, ...rest }: TextFieldProps) {
  const input = (
    <input
      id={id}
      name={id}
      className={[styles.control, error && styles.invalid, leading && styles.withLeading, trailing && styles.withTrailing, className]
        .filter(Boolean)
        .join(" ")}
      aria-invalid={error ? true : undefined}
      aria-required={required || undefined}
      aria-describedby={describedBy(id, error, hint)}
      {...rest}
    />
  );
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      {leading || trailing ? (
        <div className={styles.adorned}>
          {leading && (
            <span className={styles.leading} aria-hidden="true">
              {leading}
            </span>
          )}
          {input}
          {trailing && <span className={styles.trailing}>{trailing}</span>}
        </div>
      ) : (
        input
      )}
    </FieldShell>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function SelectField({ id, label, error, hint, required, options, placeholder, ...rest }: SelectFieldProps) {
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      <select
        id={id}
        name={id}
        className={[styles.control, error && styles.invalid].filter(Boolean).join(" ")}
        aria-invalid={error ? true : undefined}
        aria-required={required || undefined}
        aria-describedby={describedBy(id, error, hint)}
        {...rest}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
