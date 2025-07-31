type LoginButtonProps = {
  onClick: () => void;
};

const LoginButton: React.FC<LoginButtonProps> = ({ onClick }) => {
  return (
    <div className="ml-auto">
      <button onClick={onClick} className="text-blue-600 hover:underline">
        Login
      </button>
    </div>
  );
};

export default LoginButton;
