import React from "react";

type Props = {
  form: {
    first_name: string;
    last_name: string;
    email: string;
    plain_password: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  goToLogin: () => void;
};

const RegisterForm: React.FC<Props> = ({
  form,
  handleChange,
  handleSubmit,
  goToLogin,
}) => (
  <form onSubmit={handleSubmit}>
    <input
      name="first_name"
      placeholder="First Name"
      value={form.first_name}
      onChange={handleChange}
      className="w-full px-4 py-2 mb-4 border rounded-md"
    />
    <input
      name="last_name"
      placeholder="Last Name"
      value={form.last_name}
      onChange={handleChange}
      className="w-full px-4 py-2 mb-4 border rounded-md"
    />
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
      className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 mb-2"
    >
      Register
    </button>
    <div className="w-full flex justify-center items-center">
      <button
        type="button"
        onClick={goToLogin}
        className="text-blue-600 hover:underline text-sm bg-transparent border-0 p-0 cursor-pointer mt-2"
        style={{ backgroundColor: 'transparent' }}
      >
        Back to Login
      </button>
    </div>
  </form>
);

export default RegisterForm;
