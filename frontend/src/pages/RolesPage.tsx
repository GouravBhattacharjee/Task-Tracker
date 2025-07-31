import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchRoles, createRole, updateRole, RoleModel, fetchRolePermissions } from '../services/RoleService';
import RoleForm from '../components/Form/RoleForm';
import RoleListItem from '../components/ListItem/RoleListItem';
import { useAuth } from '../contexts/AuthContext';

const initialForm = {
  role_name: '',
  permissions: [] as string[]
};

const RolesPage = () => {
  const [roles, setRoles] = useState<RoleModel[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allPermissions, setAllPermissions] = useState<string[]>([]);

  const { user } = useAuth();

  const location = useLocation();
  useEffect(() => {
    loadRoles();
  }, [location.key]);

  useEffect(() => {
    const loadPermissions = async () => {
    try {
      const perms = await fetchRolePermissions();
      // Map objects to strings
      const permNames = perms.map((p: { role_permissions_name: string }) => p.role_permissions_name);
      setAllPermissions(permNames);
    } catch {
      setError('Failed to load permissions');
    }
  };

    loadPermissions();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRoles();
      setRoles(data);
    } catch {
      setError('Failed to load roles');
    }
    setLoading(false);
  };

  const handlePermissionToggle = (perm: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const permissionsString = JSON.stringify(form.permissions).replace(/"/g, "'");

      if (editingId) {
        await updateRole({
          role_id: editingId,
          role_name: form.role_name,
          role_permissions: permissionsString,
          modified_by_email: user!.email
        });
      } else {
        await createRole({
          role_name: form.role_name,
          role_permissions: permissionsString,
          created_by_email: user!.email,
          modified_by_email: user!.email
        });
      }

      setForm(initialForm);
      setEditingId(null);
      await loadRoles();
    } catch {
      setError('Failed to save role');
    }

    setLoading(false);
  };

  const handleEdit = (role: RoleModel) => {
    let parsedPermissions: string[] = [];

    try {
      parsedPermissions = JSON.parse(role.role_permissions.replace(/'/g, '"'));
    } catch {
      parsedPermissions = [];
    }

    setForm({
      role_name: role.role_name || '',
      permissions: parsedPermissions,
    });

    setEditingId(role.role_id);
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await updateRole({ role_id: id, role_active: false, modified_by_email: user!.email });
      await loadRoles();
    } catch {
      setError('Failed to delete role');
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Roles</h2>
      {loading && <div className="text-blue-600">Loading...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}

      <RoleForm
        form={form}
        allPermissions={allPermissions}
        editingId={editingId}
        loading={loading}
        handleChange={handleChange}
        handlePermissionToggle={handlePermissionToggle}
        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
      />

      <ul className="space-y-3">
        {roles.map((role) => (
          <RoleListItem
            key={role.role_id}
            role={role}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </ul>
    </div>
  );
};

export default RolesPage;
