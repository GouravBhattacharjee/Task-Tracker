import { useAuth } from "../../contexts/AuthContext";

const LogoutButton = () => {
  const { logout } = useAuth();

  return (
    <button onClick={logout} className="text-red-600 hover:underline">
      Logout
    </button>
  );
};

export default LogoutButton;
