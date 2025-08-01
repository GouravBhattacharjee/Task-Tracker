type RegisterButtonProps = {
  type?: "button" | "submit";
};

const RegisterButton: React.FC<RegisterButtonProps> = ({ type = "submit" }) => {
  return (
    <button
      type={type}
      className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 mb-2"
      id="register-btn"
    >
      Register
    </button>
  );
};

export default RegisterButton;
