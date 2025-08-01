import React from "react";
import GoogleSignInButton from "../Buttons/GoogleSignInButton";
import RegisterButton from "../Buttons/RegisterButton";

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
  onGoogleSuccess: (credentialResponse: any) => void;
  onGoogleError?: (message: string) => void;
  readOnlyEmail?: boolean;
  loadingGoogle?: boolean;
};

const RegisterForm: React.FC<Props> = ({
  form,
  handleChange,
  handleSubmit,
  goToLogin,
  onGoogleSuccess,
  onGoogleError,
  readOnlyEmail,
  loadingGoogle,
}) => (
  <form onSubmit={handleSubmit}>
    <input
      name="first_name"
      placeholder="First Name"
      value={form.first_name}
      onChange={handleChange}
      className="w-full px-4 py-2 mb-4 border rounded-md"
      required
    />
    <input
      name="last_name"
      placeholder="Last Name"
      value={form.last_name}
      onChange={handleChange}
      className="w-full px-4 py-2 mb-4 border rounded-md"
      required
    />
    <input
      name="email"
      type="email"
      placeholder="Email"
      value={form.email}
      onChange={handleChange}
      className="w-full px-4 py-2 mb-4 border rounded-md"
      readOnly={readOnlyEmail}
      required
    />
    <input
      name="plain_password"
      type="password"
      placeholder="Password"
      value={form.plain_password}
      onChange={handleChange}
      className="w-full px-4 py-2 mb-4 border rounded-md"
      required
    />

    <RegisterButton />

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
        mode="register"
      />
    </div>

    <div className="w-full flex justify-center items-center">
      <button
        type="button"
        onClick={goToLogin}
        className="text-blue-600 hover:underline text-sm bg-transparent border-0 p-0 cursor-pointer mt-2"
        style={{ backgroundColor: "transparent" }}
      >
        Back to Login
      </button>
    </div>
  </form>
);

export default RegisterForm;
