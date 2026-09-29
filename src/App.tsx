import type { LoginCredentials } from './types/auth';
import LoginPage from './pages/LoginPage/LoginPage';

const wait = (delay: number) => {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, delay);
  });
};

const mockLogin = async (credentials: LoginCredentials) => {
  await wait(800);

  if (credentials.password === 'wrong-password') {
    throw new Error('Invalid email or password.');
  }
};

function App() {
  return <LoginPage login={mockLogin} />;
}

export default App;
