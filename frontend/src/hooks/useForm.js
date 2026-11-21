import { useState } from 'react';

export function useForm(initialValues, validate, save, onSuccess) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  return {
    error,
    busy,
    field(name) {
      return {
        id: name,
        value: values[name],
        error: errors[name],
        disabled: busy,
        onChange: (event) => {
          const { value } = event.target;
          setValues((current) => ({ ...current, [name]: value }));
          setErrors((current) => ({ ...current, [name]: '' }));
          setError('');
        },
      };
    },
    async submit(event) {
      event.preventDefault();
      if (busy) return;

      const nextErrors = validate(values);
      setErrors(nextErrors);
      setError('');
      if (Object.keys(nextErrors).length) return;

      setBusy(true);
      try {
        const result = await save(values);
        onSuccess(result);
      } catch (failure) {
        setErrors(failure.fields ?? {});
        setError(failure.message || 'Không thể lưu dữ liệu. Vui lòng thử lại.');
      } finally {
        setBusy(false);
      }
    },
    reset() {
      setValues(initialValues);
      setErrors({});
      setError('');
    },
  };
}
