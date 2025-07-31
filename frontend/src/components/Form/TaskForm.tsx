import React from 'react';
import { UserModel } from '../../services/UserService';
import { useAuth } from '../../contexts/AuthContext';

interface TaskFormProps {
  form: {
    task_description: string;
    task_due_date: string;
    owner_id: number;
    project_id: number;
  };
  users: UserModel[];
  editingId: number | null;
  loading: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({
  form,
  users,
  editingId,
  loading,
  handleChange,
  handleSubmit,
  handleCancel
}) => {
  const { user } = useAuth();
  const canCreate = user?.role_permissions_parsed.includes("create_task");

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="flex flex-col">
        <label htmlFor="task_description" className="mb-1 text-sm font-medium text-gray-700">
          Task Description
        </label>
        <input
          id="task_description"
          name="task_description"
          placeholder="Task Description"
          value={form.task_description}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 p-2 rounded h-[40px]"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="task_due_date" className="mb-1 text-sm font-medium text-gray-700">
          Task Due Date
        </label>
        <input
          id="task_due_date"
          name="task_due_date"
          type="date"
          value={form.task_due_date}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 p-2 rounded h-[40px]"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="owner_id" className="mb-1 text-sm font-medium text-gray-700">
          Assign to User
        </label>
        <select
          id="owner_id"
          name="owner_id"
          value={form.owner_id || ''}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 p-2 rounded h-[40px]"
        >
          <option value="" disabled hidden>Assign to User</option>
          {users.map((user) => (
            <option key={user.user_id} value={user.user_id}>
              {user.email}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 justify-end self-end">
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

export default TaskForm;
