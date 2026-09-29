import type { LoginCredentials } from './types/auth';
import Button from './components/atoms/Button/Button';
import AuthTemplate from './components/templates/AuthTemplate/AuthTemplate';
import LoginPage from './pages/LoginPage/LoginPage';
import useSession from './session/useSession';

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
  const { isAuthenticated, startSession, endSession } = useSession();

  const handleLogin = async (credentials: LoginCredentials) => {
    await mockLogin(credentials);
    startSession('mock-access-token');
  };

  if (isAuthenticated) {
    return (
      <AuthTemplate
        title="Session active"
        description="This in-memory session ends when you refresh the page."
      >
        <Button onClick={endSession}>Log out</Button>
      </AuthTemplate>
    );
  }

  return <LoginPage login={handleLogin} />;
}

export default App;
