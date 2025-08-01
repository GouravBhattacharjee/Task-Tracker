type ForgotPasswordButtonProps = {
  type?: "button" | "submit";
};

const ForgotPasswordButton: React.FC<ForgotPasswordButtonProps> = ({
  type = "submit",
}) => {
  return (
    <button
      type={type}
      className="w-full bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700 mb-2"
    >
      Send Reset Link
    </button>
  );
};

export default ForgotPasswordButton;
