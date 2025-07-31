import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userLogin, userRegister, userForgotPassword } from '../services/AuthService';
import AuthForm from '../components/Form/AuthForm';
import RegisterForm from '../components/Form/RegisterForm';
import ForgotPasswordForm from '../components/Form/ForgotPasswordForm';

const initialForm = {
  first_name: '',
  last_name: '',
  email: '',
  plain_password: '',
  role_id: 3,
};

const AuthPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate('/projects');
  }, [user, navigate]);

  useEffect(() => {
    // Prevent scrollbars on body when AuthPage is mounted
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'role_id' ? parseInt(value) : value }));
  };

  const capitalizeName = (name: string) =>
    name.toLowerCase().split(' ').filter(Boolean).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const resetForm = () => setForm(initialForm);

  // Handler for AuthForm submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const data = await userLogin({ email: form.email, plain_password: form.plain_password });
      login(data.access_token);
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    }
  };

  // Handler for RegisterForm submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await userRegister({
        ...form,
        first_name: capitalizeName(form.first_name),
        last_name: capitalizeName(form.last_name),
        created_by_email: user!.email,
        modified_by_email: user!.email
      });
      setMessage('Registration successful! Please log in.');
      setMode('login');
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    }
  };

  // Handler for ForgotPasswordForm submit
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await userForgotPassword({ email: form.email, modified_by_email: user!.email });
      setMessage('Password reset email sent. Please check your inbox.');
      setMode('login');
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <h2 className="text-2xl font-semibold mb-6">
          {mode === "login" && "Log in to Your Account"}
          {mode === "register" && "Register a New Account"}
          {mode === "forgot" && "Forgot Password"}
        </h2>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-4">{message}</p>}

        {mode === "login" && (
          <AuthForm
            form={{ email: form.email, plain_password: form.plain_password }}
            handleChange={handleChange}
            handleSubmit={handleLoginSubmit}
            forgotPassword={() => {
              setMode('forgot');
              resetForm();
              setError(null);
              setMessage(null);
            }}
            goToRegister={() => {
              setMode('register');
              resetForm();
              setError(null);
              setMessage(null);
            }}
          />
        )}

        {mode === "register" && (
          <RegisterForm
            form={{
              first_name: form.first_name,
              last_name: form.last_name,
              email: form.email,
              plain_password: form.plain_password
            }}
            handleChange={handleChange}
            handleSubmit={handleRegisterSubmit}
            goToLogin={() => {
              setMode('login');
              resetForm();
              setError(null);
              setMessage(null);
            }}
          />
        )}

        {mode === "forgot" && (
          <ForgotPasswordForm
            email={form.email}
            handleChange={handleChange}
            handleSubmit={handleForgotPasswordSubmit}
            goToLogin={() => {
              setMode('login');
              resetForm();
              setError(null);
              setMessage(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
