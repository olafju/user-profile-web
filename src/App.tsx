import { useState } from 'react';
import Button from './components/atoms/Button/Button';
import Input from './components/atoms/Input/Input';
import Label from './components/atoms/Label/Label';
import Message from './components/atoms/Message/Message';
import Spinner from './components/atoms/Spinner/Spinner';
import Textarea from './components/atoms/Textarea/Textarea';
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');

  return (
    <main className="component-preview">
      <h1>UI atoms</h1>

      <section className="component-preview__panel">
        <div className="component-preview__field">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            placeholder="you@example.com"
            onChange={setEmail}
          />
        </div>

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
    </main>
  );
}

export default App;
