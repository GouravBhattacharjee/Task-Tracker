import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchTaskStatuses, createTaskStatus, updateTaskStatus, TaskStatusModel } from '../services/TaskStatusService';
import TaskStatusForm from '../components/Form/TaskStatusForm';
import TaskStatusListItem from '../components/ListItem/TaskStatusListItem';
import { useAuth } from '../contexts/AuthContext';

const initialForm = {
  task_status_name: ''
};

const TaskStatusPage = () => {
  const [taskStatuses, setTaskStatuses] = useState<TaskStatusModel[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  const location = useLocation();
  useEffect(() => {
    loadTaskStatuses();
  }, [location.key]);

  const loadTaskStatuses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTaskStatuses();
      setTaskStatuses(data);
    } catch {
      setError('Failed to load statuses');
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingId) {
        await updateTaskStatus({ ...form, task_status_id: editingId, modified_by_email: user!.email });
      } else {
        await createTaskStatus({ ...form, created_by_email: user!.email, modified_by_email: user!.email });
      }
      setForm(initialForm);
      setEditingId(null);
      await loadTaskStatuses();
    } catch {
      setError('Failed to save status');
    }
    setLoading(false);
  };

  const handleEdit = (status: TaskStatusModel) => {
    setForm({ task_status_name: status.task_status_name || '' });
    setEditingId(status.task_status_id);
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await updateTaskStatus({ task_status_id: id, task_status_active: false, modified_by_email: user!.email });
      await loadTaskStatuses();
    } catch {
      setError('Failed to delete task status');
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Task Status</h2>
      {loading && <div className="text-blue-600">Loading...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}

      <TaskStatusForm
        form={form}
        editingId={editingId}
        loading={loading}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
      />

      <ul className="space-y-3">
        {taskStatuses.map((status) => (
          <TaskStatusListItem
            key={status.task_status_id}
            status={status}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </div>
  );
};

export default TaskStatusPage;
