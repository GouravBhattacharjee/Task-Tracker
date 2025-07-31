import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchUsers, updateUser, UserModel } from '../services/UserService';
import { fetchRoles, RoleModel } from '../services/RoleService';
import { userRegister } from '../services/AuthService';
import UserForm from '../components/Form/UserForm';
import UserListItem from '../components/ListItem/UserListItem';
import { useAuth } from '../contexts/AuthContext';

const initialForm = {
  first_name: '',
  last_name: '',
  email: '',
  plain_password: '',
  role_id: 0
};

const UsersPage = () => {
  const [users, setUsers] = useState<UserModel[]>([]);
  const [roles, setRoles] = useState<RoleModel[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  const location = useLocation();
  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [location.key]);

  const roleMap = useMemo(() => {
    const map: Record<number, string> = {};
    roles.forEach(role => {
      map[role.role_id] = role.role_name;
    });
    return map;
  }, [roles]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch {
      setError('Failed to load users');
    }
    setLoading(false);
  };

  const loadRoles = async () => {
    try {
      const data = await fetchRoles();
      setRoles(data);
    } catch {}
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingId) {
        await updateUser({ ...form, user_id: editingId, modified_by_email: user!.email });
      } else {
        await userRegister({ ...form, created_by_email: user!.email, modified_by_email: user!.email });
      }
      setForm(initialForm);
      setEditingId(null);
      await loadUsers();
    } catch {
      setError('Failed to save user');
    }
    setLoading(false);
  };

  const handleEdit = (user: UserModel) => {
    setForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      plain_password: user.plain_password || '',
      role_id: user.role_id || 0
    });
    setEditingId(user.user_id);
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await updateUser({ user_id: id, user_active: false, modified_by_email: user!.email });
      await loadUsers();
    } catch {
      setError('Failed to delete user');
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Users</h2>
      {loading && <div className="text-blue-600">Loading...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}

      <UserForm
        form={form}
        roles={roles}
        editingId={editingId}
        loading={loading}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
      />

      <ul className="space-y-3">
        {users.map((user) => (
          <UserListItem
            key={user.user_id}
            user={user}
            roleName={roleMap[user.role_id] || 'Unknown Role'}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </div>
  );
};

export default UsersPage;
