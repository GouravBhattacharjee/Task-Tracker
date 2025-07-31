import React from "react";
import GoogleSignInButton from "../Buttons/GoogleSignInButton";

type Props = {
  form: {
    email: string;
    plain_password: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  forgotPassword: () => void;
  goToRegister: () => void;
  onGoogleSuccess: (credentialResponse: any) => void; // new prop
  onGoogleError?: (message: string) => void; // optional
  loadingGoogle?: boolean;
};

const LoginForm: React.FC<Props> = ({
  form,
  handleChange,
  handleSubmit,
  forgotPassword,
  goToRegister,
  onGoogleSuccess,
  onGoogleError,
  loadingGoogle,
}) => (
  <form onSubmit={handleSubmit}>
    <input
      name="email"
      type="email"
      placeholder="Email"
      value={form.email}
      onChange={handleChange}
      className="w-full px-4 py-2 mb-4 border rounded-md"
    />
    <input
      name="plain_password"
      type="password"
      placeholder="Password"
      value={form.plain_password}
      onChange={handleChange}
      className="w-full px-4 py-2 mb-4 border rounded-md"
    />

    <button
      type="submit"
      className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
    >
      Login
    </button>

    <div className="flex items-center w-full my-3">
      <div className="flex-grow h-px bg-gray-300"></div>
      <span className="mx-2 text-gray-500 text-sm font-semibold">OR</span>
      <div className="flex-grow h-px bg-gray-300"></div>
    </div>

    <div className="w-full">
      <GoogleSignInButton
        onSuccess={onGoogleSuccess}
        onError={onGoogleError}
        loading={loadingGoogle}
      />
    </div>

    <div className="flex justify-between items-center w-full my-4">
      <button
        type="button"
        onClick={goToRegister}
        className="text-blue-600 hover:underline text-sm bg-transparent border-0 p-0 cursor-pointer"
        style={{ backgroundColor: "transparent" }}
      >
        Sign Up
      </button>
      <button
        type="button"
        onClick={forgotPassword}
        className="text-blue-600 hover:underline text-sm bg-transparent border-0 p-0 cursor-pointer"
        style={{ backgroundColor: "transparent" }}
      >
        Forgot Password?
      </button>
    </div>
  </form>
);

export default LoginForm;
