import React from "react";
import { TaskModel } from "../../services/TaskService";
import { TaskStatusModel } from "../../services/TaskStatusService";
import { useAuth } from "../../contexts/AuthContext";

interface TaskListItemProps {
  task: TaskModel;
  userMap: Record<number, string>;
  taskStatuses: TaskStatusModel[];
  onEdit: (task: TaskModel) => void;
  onDelete: (id: number) => void;
  onStatusChange: (task: TaskModel, newStatusID: number) => void;
  loading: boolean;
}

const TaskListItem: React.FC<TaskListItemProps> = ({
  task,
  userMap,
  taskStatuses,
  onEdit,
  onDelete,
  onStatusChange,
  loading,
}) => {
  const { user } = useAuth();
  const canEdit = user?.role_permissions_parsed.includes("update_task");
  const canDelete = user?.role_permissions_parsed.includes("delete_task");

  return (
    <li className="border border-gray-300 p-4 rounded shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="font-semibold text-lg w-32 truncate flex items-center">
          {task.task_description}
        </div>
        <select
          value={task.task_status_id}
          onChange={(e) => onStatusChange(task, Number(e.target.value))}
          disabled={loading}
          className="border border-gray-300 p-2 rounded sm:ml-4 w-full sm:w-32"
        >
          {taskStatuses.map((status) => (
            <option key={status.task_status_id} value={status.task_status_id}>
              {status.task_status_name}
            </option>
          ))}
        </select>
      </div>

      <div className="text-sm text-gray-600 flex items-center">
        <span className="truncate w-64">
          Due: {task.task_due_date?.substring(0, 10)} <br />
          Owner: {userMap[task.owner_id] || "Unknown User"}
        </span>
      </div>

      <div className="flex gap-2 items-center">
        <button
          onClick={() => canEdit && onEdit(task)}
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
          onClick={() => canDelete && onDelete(task.task_id)}
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

export default TaskListItem;
