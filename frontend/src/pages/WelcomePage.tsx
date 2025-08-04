import React from "react";
import { useAuth } from "../contexts/AuthContext";

const WelcomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center h-full mt-16">
      <img
        src={require("../assets/task-tracker-icon.png")}
        alt="Task Tracker"
        className="h-20 w-20 mb-4"
      />
      <h1 className="text-3xl font-bold mb-2">Welcome to Task Tracker!</h1>
      <p className="text-lg mb-4">
        Hello, <b>{user?.first_name} {user?.last_name}</b>! Manage your projects and tasks
        efficiently.
      </p>
    </div>
  );
};

export default WelcomePage;
