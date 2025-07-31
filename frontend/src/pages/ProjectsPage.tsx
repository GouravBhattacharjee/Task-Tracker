import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchProjects, createProject, updateProject, ProjectModel } from '../services/ProjectService';
import { fetchUsers, UserModel } from '../services/UserService';
import ProjectForm from '../components/Form/ProjectForm';
import ProjectListItem from '../components/ListItem/ProjectListItem';
import { useAuth } from '../contexts/AuthContext';

const initialForm = {
  project_name: '',
  project_description: '',
  project_start_date: '',
  project_end_date: ''
};

const ProjectsPage = () => {
  const [projects, setProjects] = useState<ProjectModel[]>([]);
  const [users, setUsers] = useState<UserModel[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch {
      setError('Failed to load projects');
    }
    setLoading(false);
  };

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch {}
  };

  const location = useLocation();
  useEffect(() => {
    loadProjects();
    loadUsers();
  }, [location.key]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingId) {
        await updateProject({ ...form, project_id: editingId, modified_by_email: user!.email });
      } else {
        await createProject({ ...form, owner_id: user!.user_id, created_by_email: user!.email, modified_by_email: user!.email });
      }
      setForm(initialForm);
      setEditingId(null);
      await loadProjects();
    } catch {
      setError('Failed to save project');
    }
    setLoading(false);
  };

  const handleEdit = (project: ProjectModel) => {
    setForm({
      project_name: project.project_name || '',
      project_description: project.project_description || '',
      project_start_date: project.project_start_date || '',
      project_end_date: project.project_end_date || ''
    });
    setEditingId(project.project_id);
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await updateProject({ project_id: id, project_active: false, modified_by_email: user!.email });
      await loadProjects();
    } catch {
      setError('Failed to delete project');
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Projects</h2>

      {loading && <div className="text-center text-gray-500">Loading...</div>}
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}

      <ProjectForm
        form={form}
        editingId={editingId}
        loading={loading}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
      />

      <ul className="space-y-4">
        {projects.map((project) => (
          <ProjectListItem
            key={project.project_id}
            project={project}
            ownerName={users.find((u) => u.user_id === project.owner_id)?.email || 'N/A'}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </div>
  );
};

export default ProjectsPage;