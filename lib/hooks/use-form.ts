import { useState, useCallback, ChangeEvent } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldValue = string | boolean | number;

type FormValues = Record<string, FieldValue>;

type ValidationRule<T extends FormValues> = {
  required?: boolean | string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  validate?: (value: FieldValue, values: T) => string | true;
};

type FormRules<T extends FormValues> = Partial<Record<keyof T, ValidationRule<T>>>;

type FormErrors<T extends FormValues> = Partial<Record<keyof T, string>>;

type TouchedFields<T extends FormValues> = Partial<Record<keyof T, boolean>>;

type FieldProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur: () => void;
  error?: string;
};

interface UseFormOptions<T extends FormValues> {
  initialValues: T;
  rules?: FormRules<T>;
  /** Called only when the form is valid */
  onSubmit?: (values: T) => void | Promise<void>;
}

interface UseFormReturn<T extends FormValues> {
  values: T;
  errors: FormErrors<T>;
  touched: TouchedFields<T>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
  /** Register a field — spread the returned props onto your input */
  register: (name: keyof T) => FieldProps;
  /** Manually set a single field value */
  setValue: (name: keyof T, value: FieldValue) => void;
  /** Manually set a single field error */
  setError: (name: keyof T, message: string) => void;
  /** Clear a single field error */
  clearError: (name: keyof T) => void;
  /** Set multiple server-side errors at once (e.g. from API response) */
  setErrors: (errors: FormErrors<T>) => void;
  /** Trigger validation and call onSubmit if valid */
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  onChange: (field: keyof T, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>|string|number|boolean) => void;
  
  /** Reset to initial values */
  reset: () => void;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateField<T extends FormValues>(
  name: keyof T,
  value: FieldValue,
  values: T,
  rules?: FormRules<T>
): string | undefined {
  const rule = rules?.[name];
  if (!rule) return undefined;

  if (rule.required) {
    const empty = value === "" || value === null || value === undefined;
    if (empty) {
      return typeof rule.required === "string" ? rule.required : "This field is required.";
    }
  }

  if (typeof value === "string") {
    if (rule.minLength && value.length < rule.minLength.value) {
      return rule.minLength.message;
    }
    if (rule.maxLength && value.length > rule.maxLength.value) {
      return rule.maxLength.message;
    }
    if (rule.pattern && !rule.pattern.value.test(value)) {
      return rule.pattern.message;
    }
  }

  if (rule.validate) {
    const result = rule.validate(value, values);
    if (result !== true) return result;
  }

  return undefined;
}

function validateAll<T extends FormValues>(
  values: T,
  rules?: FormRules<T>
): FormErrors<T> {
  if (!rules) return {};
  const errors: FormErrors<T> = {};
  for (const name in rules) {
    const err = validateField(name as keyof T, values[name as keyof T], values, rules);
    if (err) errors[name as keyof T] = err;
  }
  return errors;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useForm<T extends FormValues>({
  initialValues,
  rules,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<TouchedFields<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  const isValid = Object.keys(validateAll(values, rules)).length === 0;

  const setValue = useCallback((name: keyof T, value: FieldValue) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Re-validate on change if already touched
    setTouched((prev) => {
      if (!prev[name]) return prev;
      return prev;
    });
    setErrorsState((prev) => {
      const err = validateField(name, value, { ...values, [name]: value } as T, rules);
      if (!err) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return { ...prev, [name]: err };
    });
  }, [values, rules]);

  const setError = useCallback((name: keyof T, message: string) => {
    setErrorsState((prev) => ({ ...prev, [name]: message }));
  }, []);

  const clearError = useCallback((name: keyof T) => {
    setErrorsState((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const setErrors = useCallback((newErrors: FormErrors<T>) => {
    setErrorsState((prev) => ({ ...prev, ...newErrors }));
  }, []);

  const register = useCallback((name: keyof T): FieldProps => ({
    value: String(values[name] ?? ""),
    onChange: (e) => setValue(name, e.target.value),
    onBlur: () => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      const err = validateField(name, values[name], values, rules);
      setErrorsState((prev) =>
        err ? { ...prev, [name]: err } : (({ [name]: _, ...rest }) => rest)(prev) as FormErrors<T>
      );
    },
    error: touched[name] ? errors[name] : undefined,
  }), [values, errors, touched, rules, setValue]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Touch all fields so errors show
    const allTouched = Object.keys(initialValues).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as TouchedFields<T>
    );
    setTouched(allTouched);

    const validationErrors = validateAll(values, rules);
    setErrorsState(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit?.(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, rules, onSubmit, initialValues]);

  // Replace the empty 'const onChange' with this:
  const onChange = useCallback(
    (field: keyof T, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | string | number | boolean>) => {
      if(typeof e === "string") {
        setValue(field, e);
        return;
      }
      else if(typeof e === "number") {
        setValue(field, e);
        return;
      }
      else if(typeof e === "boolean") {
        setValue(field, e);
        return;
      }else{
        const { name, value, type } = e.target;
        
        // Handle checkboxes specifically, otherwise use the standard string value
        let parsedValue: FieldValue = value;
        if (type === "checkbox") {
          parsedValue = (e.target as HTMLInputElement).checked;
        } else if (type === "number" && value !== "") {
           // Optionally handle number inputs if you want them stored as numbers
          parsedValue = Number(value);
        }
  
        setValue(name as keyof T || field, parsedValue);
      }

    },
    [setValue]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrorsState({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isDirty,
    isValid,
    onChange,
    register,
    setValue,
    setError,
    clearError,
    setErrors,
    handleSubmit,
    reset,
  };
}