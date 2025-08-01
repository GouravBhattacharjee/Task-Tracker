type LoginButtonProps = {
  type?: "button" | "submit";
};

const LoginButton: React.FC<LoginButtonProps> = ({ type = "submit" }) => {
  return (
    <button
      type={type}
      className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
      id="login-btn"
    >
      Login
    </button>
  );
};

export default LoginButton;
