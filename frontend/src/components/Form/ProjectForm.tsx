import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface ProjectFormProps {
  form: {
    project_name: string;
    project_description: string;
    project_start_date: string;
    project_end_date: string;
  };
  editingId: number | null;
  loading: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleCancel: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  form,
  editingId,
  loading,
  handleChange,
  handleSubmit,
  handleCancel
}) => {
  const { user } = useAuth();
  const canCreate = user?.role_permissions_parsed.includes("create_project");

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="flex flex-col">
        <label htmlFor="project_name" className="mb-1 text-sm font-medium text-gray-700">
          Project Name
        </label>
        <input
          id="project_name"
          name="project_name"
          placeholder="Enter project name"
          value={form.project_name}
          onChange={handleChange}
          required
          className="p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 h-[40px]"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="project_description" className="mb-1 text-sm font-medium text-gray-700">
          Description
        </label>
        <input
          id="project_description"
          name="project_description"
          placeholder="Enter description"
          value={form.project_description}
          onChange={handleChange}
          required
          className="p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 h-[40px]"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="project_start_date" className="mb-1 text-sm font-medium text-gray-700">
          Start Date
        </label>
        <input
          id="project_start_date"
          name="project_start_date"
          type="date"
          value={form.project_start_date}
          onChange={handleChange}
          required
          className="p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 h-[40px]"
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="project_end_date" className="mb-1 text-sm font-medium text-gray-700">
          End Date
        </label>
        <input
          id="project_end_date"
          name="project_end_date"
          type="date"
          value={form.project_end_date}
          onChange={handleChange}
          required
          className="p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 h-[40px]"
        />
      </div>

      <div className="flex items-center gap-4">
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
            className="bg-gray-400 text-white px-4 py-2 rounded shadow hover:bg-gray-500 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ProjectForm;