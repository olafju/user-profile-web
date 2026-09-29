import type { MouseEventHandler, ReactNode } from 'react';
import './Button.css';

type ButtonProps = {
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

function Button({
  type = 'button',
  variant = 'primary',
  disabled,
  children,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={`button button--${variant}`}
      type={type}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
