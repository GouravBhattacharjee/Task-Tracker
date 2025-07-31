import React from "react";

type Props = {
  form: {
    email: string;
    plain_password: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  forgotPassword: () => void;
  goToRegister: () => void;
};

const AuthForm: React.FC<Props> = ({
  form,
  handleChange,
  handleSubmit,
  forgotPassword,
  goToRegister,
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
      className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 mb-2"
    >
      Login
    </button>
    <div className="flex justify-between items-center mt-4 w-full">
      <button
        type="button"
        onClick={goToRegister}
        className="text-blue-600 hover:underline text-sm bg-transparent border-0 p-0 cursor-pointer mt-2"
        style={{ backgroundColor: 'transparent' }}
      >
        Sign Up
      </button>
      <button
        type="button"
        onClick={forgotPassword}
        className="text-blue-600 hover:underline text-sm bg-transparent border-0 p-0 cursor-pointer mt-2"
        style={{ backgroundColor: 'transparent' }}
      >
        Forgot Password?
      </button>
    </div>
  </form>
);

export default AuthForm;
