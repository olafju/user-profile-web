import './ReadOnlyField.css';

type ReadOnlyFieldProps = {
  label: string;
  value: string;
};

function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  return (
    <div className="read-only-field">
      <span className="read-only-field__label">{label}</span>
      <p className="read-only-field__value">{value}</p>
    </div>
  );
}

export default ReadOnlyField;
