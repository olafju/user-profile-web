import { useState } from 'react';
import type { LoginCredentials } from './types/auth';
import Message from './components/atoms/Message/Message';
import LoginForm from './components/organisms/LoginForm/LoginForm';
import AuthTemplate from './components/templates/AuthTemplate/AuthTemplate';

function App() {
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleLogin = (credentials: LoginCredentials) => {
    setSubmittedEmail(credentials.email);
  };

  return (
    <AuthTemplate
      title="Welcome back"
      description="Log in to manage your profile."
    >
      <LoginForm onSubmit={handleLogin} />
      {submittedEmail && (
        <Message variant="success">
          Form submitted for {submittedEmail}.
        </Message>
      )}
    </AuthTemplate>
  );
}

export default App;
