import { useState } from 'react';
import type { LoginCredentials } from './types/auth';
import Button from './components/atoms/Button/Button';
import Label from './components/atoms/Label/Label';
import Message from './components/atoms/Message/Message';
import Spinner from './components/atoms/Spinner/Spinner';
import Textarea from './components/atoms/Textarea/Textarea';
import FormField from './components/molecules/FormField/FormField';
import LoginForm from './components/organisms/LoginForm/LoginForm';
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleLogin = (credentials: LoginCredentials) => {
    setSubmittedEmail(credentials.email);
  };

  return (
    <main className="component-preview">
      <h1>UI components</h1>

      <section className="component-preview__panel">
        <FormField
          id="email"
          label="Email"
          type="email"
          value={email}
          placeholder="you@example.com"
          error={
            email.length > 0 && !email.includes('@')
              ? 'Enter a valid email address.'
              : undefined
          }
          onChange={setEmail}
        />

        <div className="component-preview__field">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            placeholder="Write something about yourself"
            onChange={setBio}
          />
        </div>

        <div className="component-preview__actions">
          <Button>Primary button</Button>
          <Button variant="secondary">Secondary button</Button>
          <Button disabled>
            <Spinner label="Loading" />
            Loading
          </Button>
        </div>

        <div className="component-preview__messages">
          <Message variant="info">This is an information message.</Message>
          <Message variant="success">Changes saved successfully.</Message>
          <Message variant="error">Something went wrong.</Message>
        </div>
      </section>

      <section className="component-preview__panel">
        <h2>Login form organism</h2>
        <LoginForm onSubmit={handleLogin} />
        {submittedEmail && (
          <Message variant="success">
            Form submitted for {submittedEmail}.
          </Message>
        )}
      </section>
    </main>
  );
}

export default App;
