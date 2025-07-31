import React from "react";

type Props = {
  email: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  goToLogin: () => void;
};

const ForgotPasswordForm: React.FC<Props> = ({
  email,
  handleChange,
  handleSubmit,
  goToLogin,
}) => (
  <form onSubmit={handleSubmit}>
    <input
      name="email"
      type="email"
      placeholder="Email"
      value={email}
      onChange={handleChange}
      className="w-full px-4 py-2 mb-4 border rounded-md"
    />
    <button
      type="submit"
      className="w-full bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700 mb-2"
    >
      Send Reset Link
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

export default ForgotPasswordForm;
