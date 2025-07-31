import React from 'react';
import { RoleModel } from '../../services/RoleService';
import { useAuth } from '../../contexts/AuthContext';

interface RoleListItemProps {
  role: RoleModel;
  onEdit: (role: RoleModel) => void;
  onDelete: (id: number) => void;
}

const RoleListItem: React.FC<RoleListItemProps> = ({ role, onEdit, onDelete }) => {
  const { user } = useAuth();
  const canEdit = user?.role_permissions_parsed.includes("update_role");
  const canDelete = user?.role_permissions_parsed.includes("delete_role");
  const parsedPermissions: string[] = (() => {
    try {
      return JSON.parse(role.role_permissions.replace(/'/g, '"'));
    } catch {
      return [];
    }
  })();

  return (
    <li className="flex justify-between items-center border-b pb-2">
      <div className="flex flex-col">
        <span className="font-medium">{role.role_name}</span>
        <span className="text-sm text-gray-600">
          {parsedPermissions.length > 0
            ? parsedPermissions.join(', ')
            : 'No permissions'}
        </span>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => canEdit && onEdit(role)}
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
          onClick={() => canDelete && onDelete(role.role_id)}
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

export default RoleListItem;
