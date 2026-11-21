import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

function Field({ id, label, error, hint, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined,
      })}
      {error && <span className="field-error" id={`${id}-error`}>{error}</span>}
      {hint && <span className="field-hint" id={`${id}-hint`}>{hint}</span>}
    </div>
  );
}

export function InputField({ id, label, error, hint, ...props }) {
  return <Field {...{ id, label, error, hint }}>{(attrs) => <input {...attrs} {...props} />}</Field>;
}

export function SelectField({ id, label, error, children, ...props }) {
  return <Field {...{ id, label, error }}>{(attrs) => <select {...attrs} {...props}>{children}</select>}</Field>;
}

export function PasswordField({ id, label, error, hint, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <Field {...{ id, label, error, hint }}>
      {(attrs) => (
        <div className="password-field">
          <input {...attrs} {...props} type={visible ? 'text' : 'password'} />
          <button
            type="button"
            className="icon-button password-toggle"
            aria-label={visible ? `Ẩn ${label.toLowerCase()}` : `Hiện ${label.toLowerCase()}`}
            onClick={() => setVisible(!visible)}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      )}
    </Field>
  );
}
