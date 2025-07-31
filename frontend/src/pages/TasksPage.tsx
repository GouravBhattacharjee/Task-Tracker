import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { createTask, updateTask, updateTaskStatusInTask, fetchTasksByProjectID, TaskModel } from '../services/TaskService';
import { fetchUsers, UserModel } from '../services/UserService';
import { fetchTaskStatuses, TaskStatusModel } from '../services/TaskStatusService';
import TaskForm from '../components/Form/TaskForm';
import TaskListItem from '../components/ListItem/TaskListItem';
import { useAuth } from '../contexts/AuthContext';

const initialForm = {
  task_description: '',
  task_due_date: '',
  owner_id: 0,
  project_id: 0
};

const TasksPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [tasks, setTasks] = useState<TaskModel[]>([]);
  const [users, setUsers] = useState<UserModel[]>([]);
  const [taskStatuses, setTaskStatuses] = useState<TaskStatusModel[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  const userMap = useMemo(() => {
    const map: Record<number, string> = {};
    users.forEach(user => {
      map[user.user_id] = user.email;
    });
    return map;
  }, [users]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTasksByProjectID(Number(projectId));
      setTasks(data);
    } catch {
      setError('Failed to load tasks');
    }
    setLoading(false);
  }, [projectId]);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch {}
  };

  const loadStatuses = async () => {
    try {
      const data = await fetchTaskStatuses();
      setTaskStatuses(data);
    } catch {}
  };

  const location = useLocation();
  useEffect(() => {
    setForm(prev => ({ ...prev, project_id: Number(projectId) }));
    loadTasks();
    loadUsers();
    loadStatuses();
  }, [location.key, projectId, loadTasks]);

  const projectName = (location.state as { projectName?: string })?.projectName;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingId) {
        await updateTask({ ...form, project_id: Number(projectId), task_id: editingId, modified_by_email: user!.email });
      } else {
        await createTask({ ...form, project_id: Number(projectId), task_status_id: 1, created_by_email: user!.email, modified_by_email: user!.email });
      }
      setForm(initialForm);
      setEditingId(null);
      await loadTasks();
    } catch {
      setError('Failed to save task');
    }
    setLoading(false);
  };

  const handleEdit = (task: TaskModel) => {
    setForm({
      task_description: task.task_description || '',
      task_due_date: task.task_due_date || '',
      owner_id: task.owner_id || 0,
      project_id: Number(projectId)
    });
    setEditingId(task.task_id);
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await updateTask({ task_id: id, task_active: false, modified_by_email: user!.email });
      await loadTasks();
    } catch {
      setError('Failed to delete task');
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setForm({ ...initialForm, project_id: Number(projectId) });
    setEditingId(null);
  };

  const handleStatusChange = async (task: TaskModel, newStatusID: number) => {
    setLoading(true);
    setError(null);
    try {
      await updateTaskStatusInTask({ ...task, task_status_id: newStatusID });
      await loadTasks();
    } catch {
      setError('Failed to update status');
    }
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Tasks{projectName ? ` for ${projectName}` : ''}</h2>
      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-500 mb-2">{error}</div>}

      <TaskForm
        form={form}
        users={users}
        editingId={editingId}
        loading={loading}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
      />

      <ul className="space-y-4">
        {tasks.map((task) => (
          <TaskListItem
            key={task.task_id}
            task={task}
            userMap={userMap}
            taskStatuses={taskStatuses}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            loading={loading}
          />
        ))}
      </ul>
    </div>
  );
};

export default TasksPage;