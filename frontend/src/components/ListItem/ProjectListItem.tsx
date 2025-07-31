import React from 'react';
import { ProjectModel } from '../../services/ProjectService';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface ProjectListItemProps {
  project: ProjectModel;
  ownerName: string;
  onEdit: (project: ProjectModel) => void;
  onDelete: (id: number) => void;
}

const ProjectListItem: React.FC<ProjectListItemProps> = ({ project, ownerName, onEdit, onDelete }) => {
  const { user } = useAuth();
  const canEdit = user?.role_permissions_parsed.includes("update_project");
  const canDelete = user?.role_permissions_parsed.includes("delete_project");

  return (
    <li className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <Link
          to={`/projects/${project.project_id}/tasks`}
          state={{ projectName: project.project_name }}
          className="text-lg font-bold text-blue-600 hover:underline bg-transparent border-none p-0 m-0 focus:outline-none"
        >
          {project.project_name}
        </Link>
        <p className="text-sm text-gray-600">{project.project_description}</p>
        <p className="text-sm text-gray-500">
          {project.project_start_date} to {project.project_end_date}
        </p>
        <p className="text-sm text-gray-500">Owner: {ownerName}</p>
      </div>
      <div className="mt-4 md:mt-0 flex gap-2">
        <button
          onClick={() => canEdit && onEdit(project)}
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
          onClick={() => canDelete && onDelete(project.project_id)}
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

export default ProjectListItem;
