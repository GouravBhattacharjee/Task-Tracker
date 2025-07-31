import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface TaskStatusFormProps {
  form: {
    task_status_name: string;
  };
  editingId: number | null;
  loading: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleCancel: () => void;
}

const TaskStatusForm: React.FC<TaskStatusFormProps> = ({
  form,
  editingId,
  loading,
  handleChange,
  handleSubmit,
  handleCancel
}) => {
  const { user } = useAuth();
  const canCreate = user?.role_permissions_parsed.includes("create_taskstatus");

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-6 w-full items-end">
      <div className="flex flex-col gap-1 flex-1">
        <label
          htmlFor="task_status_name"
          className="text-sm font-medium text-gray-700"
        >
          Task Status Name
        </label>
        <input
          id="task_status_name"
          name="task_status_name"
          placeholder="Task Status Name"
          value={form.task_status_name}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded h-[40px]"
        />
      </div>

      <div className="flex gap-2 items-end">
        <button
          type="submit"
          disabled={loading || !canCreate}
          className={`px-4 py-2 rounded shadow transition ${
            canCreate
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {editingId ? "Update" : "Create"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TaskStatusForm;
