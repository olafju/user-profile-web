import Label from '../../atoms/Label/Label';
import Message from '../../atoms/Message/Message';
import Textarea from '../../atoms/Textarea/Textarea';
import './TextareaField.css';

type TextareaFieldProps = {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  error?: string;
  onChange: (value: string) => void;
};

function TextareaField({
  id,
  label,
  value,
  placeholder,
  disabled,
  rows,
  error,
  onChange,
}: TextareaFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="textarea-field">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
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

export default TextareaField;
