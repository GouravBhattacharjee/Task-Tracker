import React from "react";
import { UserModel } from "../../services/UserService";
import { useAuth } from "../../contexts/AuthContext";

interface UserListItemProps {
  user: UserModel;
  roleName: string;
  onEdit: (user: UserModel) => void;
  onDelete: (id: number) => void;
}

const UserListItem: React.FC<UserListItemProps> = ({
  user: userData,
  roleName,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();
  const canEdit = user?.role_permissions_parsed.includes("update_user");
  const canDelete = user?.role_permissions_parsed.includes("delete_user");

  return (
    <li className="flex justify-between items-center border-b pb-2">
      <span className="font-medium">
        {userData.first_name} {userData.last_name} - {userData.email} -{" "}
        {roleName}
      </span>
      <div className="space-x-2">
        <button
          onClick={() => canEdit && onEdit(userData)}
          disabled={!canEdit}
          className={`px-4 py-2 rounded shadow transition ${
            canEdit
              ? "bg-yellow-400 text-white hover:bg-yellow-500"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Edit
        </button>
        <button
          onClick={() => canDelete && onDelete(userData.user_id)}
          disabled={!canDelete}
          className={`px-4 py-2 rounded shadow transition ${
            canDelete
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Delete
        </button>
      </div>
    </li>
  );
};

export default UserListItem;
