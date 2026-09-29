import type { ReactNode } from 'react';
import './Message.css';

type MessageProps = {
  id?: string;
  variant: 'error' | 'success' | 'info';
  children: ReactNode;
};

function Message({ id, variant, children }: MessageProps) {
  const role = variant === 'error' ? 'alert' : 'status';

  return (
    <p className={`message message--${variant}`} id={id} role={role}>
      {children}
    </p>
  );
}

export default Message;
