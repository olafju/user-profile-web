import type { ChangeEvent } from 'react';
import './Textarea.css';

type TextareaProps = {
  id: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  ariaDescribedBy?: string;
  invalid?: boolean;
  onChange: (value: string) => void;
};

function Textarea({
  id,
  value,
  placeholder,
  disabled,
  rows = 5,
  ariaDescribedBy,
  invalid,
  onChange,
}: TextareaProps) {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <textarea
      className="textarea"
      id={id}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      aria-describedby={ariaDescribedBy}
      aria-invalid={invalid}
      onChange={handleChange}
    />
  );
}

export default Textarea;
