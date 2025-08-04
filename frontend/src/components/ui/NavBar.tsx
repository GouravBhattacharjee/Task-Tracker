import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LogoutButton from "../Buttons/LogoutButton";

const NavBar = () => {
  const { user } = useAuth();

  return (
    <nav className="p-4 border-b border-gray-300 flex flex-wrap items-center gap-4 w-full">
      <Link to="/" className="flex items-center">
        <img
          src={require("../../assets/task-tracker-icon.png")}
          alt="Task Tracker"
          className="h-8 w-8 mr-2"
        />
      </Link>
      {user && (
        <>
          <Link to="/projects" className="text-white-600 hover:underline">
            Projects
          </Link>
          {user.role_name === "admin" && (
            <>
              <Link to="/taskStatus" className="text-white-600 hover:underline">
                Task Status
              </Link>
              <Link to="/users" className="text-white-600 hover:underline">
                Users
              </Link>
              <Link to="/roles" className="text-white-600 hover:underline">
                Roles
              </Link>
            </>
          )}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-white-700">
              Hello, <b>{user.first_name}</b>
            </span>
            <LogoutButton />
          </div>
        </>
      )}
    </nav>
  );
};

export default NavBar;
