import type { ChangeEvent } from 'react';
import './Textarea.css';

type TextareaProps = {
  id: string;
  value: string;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  onChange: (value: string) => void;
};

function Textarea({
  id,
  value,
  placeholder,
  disabled,
  rows = 5,
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
      onChange={handleChange}
    />
  );
}

export default Textarea;
