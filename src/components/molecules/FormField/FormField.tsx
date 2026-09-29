import Input from '../../atoms/Input/Input';
import Label from '../../atoms/Label/Label';
import Message from '../../atoms/Message/Message';
import './FormField.css';

type FormFieldProps = {
  id: string;
  label: string;
  type: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
  error?: string;
  onChange: (value: string) => void;
};

function FormField({
  id,
  label,
  type,
  value,
  placeholder,
  disabled,
  autoComplete,
  error,
  onChange,
}: FormFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="form-field">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        ariaDescribedBy={error ? errorId : undefined}
        invalid={Boolean(error)}
        onChange={onChange}
      />
      {error && (
        <Message id={errorId} variant="error">
          {error}
        </Message>
      )}
    </div>
  );
}

export default FormField;
