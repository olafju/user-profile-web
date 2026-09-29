import type { ChangeEvent } from 'react';
import './Input.css';

type InputProps = {
  id: string;
  type: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  ariaDescribedBy?: string;
  invalid?: boolean;
  onChange: (value: string) => void;
};

function Input({
  id,
  type,
  value,
  placeholder,
  disabled,
  ariaDescribedBy,
  invalid,
  onChange,
}: InputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <input
      className="input"
      id={id}
      type={type}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      aria-describedby={ariaDescribedBy}
      aria-invalid={invalid}
      onChange={handleChange}
    />
  );
}

export default Input;
