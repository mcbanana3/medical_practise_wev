import { forwardRef, useId } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

type FieldDetails = {
  label: string;
  hint?: string;
  error?: string;
};

type FieldShellProps = FieldDetails & {
  id: string;
  required?: boolean;
  children: ReactNode;
};

function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  children,
}: FieldShellProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold"
      >
        {label}
        {required && (
          <span className="ml-1 font-normal text-ink-muted">
            (required)
          </span>
        )}
      </label>

      {hint && (
        <p id={`${id}-hint`} className="type-caption mb-2">
          {hint}
        </p>
      )}

      {children}

      {error && (
        <p
          id={`${id}-error`}
          className="mt-2 text-sm leading-6 text-danger"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function descriptions(id: string, hint?: string, error?: string) {
  return (
    [
      hint ? `${id}-hint` : "",
      error ? `${id}-error` : "",
    ]
      .filter(Boolean)
      .join(" ") || undefined
  );
}

type TextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "aria-describedby" | "aria-invalid"
> &
  FieldDetails;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    {
      id: providedId,
      label,
      hint,
      error,
      required,
      className = "",
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const id = providedId ?? generatedId;

    return (
      <FieldShell
        id={id}
        label={label}
        hint={hint}
        error={error}
        required={required}
      >
        <input
          {...props}
          ref={ref}
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={descriptions(id, hint, error)}
          className={`field-control ${className}`}
        />
      </FieldShell>
    );
  },
);

type TextAreaFieldProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "aria-describedby" | "aria-invalid"
> &
  FieldDetails;

export function TextAreaField({
  id: providedId,
  label,
  hint,
  error,
  required,
  className = "",
  ...props
}: TextAreaFieldProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
    >
      <textarea
        {...props}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={descriptions(id, hint, error)}
        className={`field-control min-h-32 resize-y ${className}`}
      />
    </FieldShell>
  );
}

type SelectFieldProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "aria-describedby" | "aria-invalid"
> &
  FieldDetails;

export function SelectField({
  id: providedId,
  label,
  hint,
  error,
  required,
  className = "",
  children,
  ...props
}: SelectFieldProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;

  return (
    <FieldShell
      id={id}
      label={label}
      hint={hint}
      error={error}
      required={required}
    >
      <select
        {...props}
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={descriptions(id, hint, error)}
        className={`field-control ${className}`}
      >
        {children}
      </select>
    </FieldShell>
  );
}

type CheckboxFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "aria-describedby" | "aria-invalid"
> &
  FieldDetails;

export function CheckboxField({
  id: providedId,
  label,
  hint,
  error,
  className = "",
  ...props
}: CheckboxFieldProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;

  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          {...props}
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={descriptions(id, hint, error)}
          className={`mt-1 size-5 shrink-0 accent-sage-ink ${className}`}
        />

        <label htmlFor={id} className="text-sm leading-7">
          {label}
          {props.required && (
            <span className="text-ink-muted"> (required)</span>
          )}
        </label>
      </div>

      {hint && (
        <p id={`${id}-hint`} className="type-caption ml-8 mt-1">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={`${id}-error`}
          className="ml-8 mt-2 text-sm text-danger"
        >
          {error}
        </p>
      )}
    </div>
  );
}