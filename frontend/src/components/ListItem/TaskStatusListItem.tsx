import React from "react";
import { TaskStatusModel } from "../../services/TaskStatusService";
import { useAuth } from "../../contexts/AuthContext";

interface TaskStatusListItemProps {
  status: TaskStatusModel;
  onEdit: (status: TaskStatusModel) => void;
  onDelete: (id: number) => void;
}

const TaskStatusListItem: React.FC<TaskStatusListItemProps> = ({
  status,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();
  const canEdit = user?.role_permissions_parsed.includes("update_taskstatus");
  const canDelete = user?.role_permissions_parsed.includes("delete_taskstatus");

  return (
    <li className="flex justify-between items-center border-b pb-2">
      <span className="font-medium">{status.task_status_name}</span>
      <div className="space-x-2">
        <button
          onClick={() => canEdit && onEdit(status)}
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
          onClick={() => canDelete && onDelete(status.task_status_id)}
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

export default TaskStatusListItem;
