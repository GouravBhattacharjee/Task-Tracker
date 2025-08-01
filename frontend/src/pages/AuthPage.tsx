import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userLogin, userRegister, userForgotPassword, userGoogleLogin } from '../services/AuthService';
import LoginForm from '../components/Form/LoginForm';
import RegisterForm from '../components/Form/RegisterForm';
import ForgotPasswordForm from '../components/Form/ForgotPasswordForm';
import axios from 'axios';
import { CredentialResponse } from '@react-oauth/google';

const initialForm = {
  first_name: '',
  last_name: '',
  email: '',
  plain_password: '',
  role_id: 3,
  provider: 'local' as 'local' | 'google'
};

const AuthPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/projects');
  }, [user, navigate]);

  // Prevent scrollbars on body
  useEffect(() => {
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
    name
      .toLowerCase()
      .split(' ')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  const resetForm = () => setForm(initialForm);

  // --- Handlers ---

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const data = await userLogin({ email: form.email, plain_password: form.plain_password });
      login(data.access_token);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.detail || 'Login failed');
      } else {
        setError('Login failed');
      }
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await userRegister({
        ...form,
        first_name: capitalizeName(form.first_name),
        last_name: capitalizeName(form.last_name),
        provider: form.provider || 'local'
      });
      setMessage('Registration successful! Please log in.');
      setMode('login');
      resetForm();
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.detail || 'Registration failed');
      } else {
        setError('Registration failed');
      }
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      await userForgotPassword({ email: form.email });
      setMessage('Password reset email sent. Please check your inbox.');
      setMode('login');
      resetForm();
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.detail || 'Failed to send reset email.');
      } else {
        setError('Failed to send reset email.');
      }
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setError("Google login failed: No credential received");
      return;
    }

    try {
      setLoadingGoogle(true);
      const data = await userGoogleLogin(credentialResponse.credential);

      if (data.status === "register") {
        setForm({
          ...form,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          plain_password: "",
          role_id: initialForm.role_id,
          provider: "google"
        });
        setMode("register");
        setLoadingGoogle(false);
      } else if (data.access_token) {
        login(data.access_token);
        setLoadingGoogle(false);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.detail || 'Google login failed');
      } else {
        setError('Google login failed');
      }
      setLoadingGoogle(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <h2 className="text-2xl font-semibold mb-6">
          {mode === 'login' && 'Log in to Your Account'}
          {mode === 'register' && 'Register a New Account'}
          {mode === 'forgot' && 'Forgot Password'}
        </h2>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        {message && <p className="text-green-600 text-sm mb-4">{message}</p>}

        {mode === 'login' && (
          <LoginForm
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
            onGoogleSuccess={handleGoogleSuccess}
            onGoogleError={(msg) => setError(msg)}
            loadingGoogle={loadingGoogle}
          />
        )}

        {mode === 'register' && (
          <RegisterForm
            form={{
              first_name: form.first_name,
              last_name: form.last_name,
              email: form.email,
              plain_password: form.plain_password,
            }}
            handleChange={handleChange}
            handleSubmit={handleRegisterSubmit}
            goToLogin={() => {
              setMode('login');
              resetForm();
              setError(null);
              setMessage(null);
            }}
            onGoogleSuccess={handleGoogleSuccess}
            onGoogleError={(msg) => setError(msg)}
            readOnlyEmail={!!form.email} // read-only if Google prefilled
            loadingGoogle={loadingGoogle}
          />
        )}

        {mode === 'forgot' && (
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
