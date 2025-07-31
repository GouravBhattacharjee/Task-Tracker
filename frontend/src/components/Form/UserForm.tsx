import React from 'react';
import { RoleModel } from '../../services/RoleService';
import { useAuth } from '../../contexts/AuthContext';

interface UserFormProps {
  form: {
    first_name: string;
    last_name: string;
    email: string;
    plain_password: string;
    role_id: number;
  };
  roles: RoleModel[];
  editingId: number | null;
  loading: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
  form,
  roles,
  editingId,
  loading,
  handleChange,
  handleSubmit,
  handleCancel
}) => {
  const { user } = useAuth();
  const canCreate = user?.role_permissions_parsed.includes("create_user");

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 items-end">
      <div className="flex flex-col gap-1">
        <label htmlFor="first_name" className="text-sm font-medium text-gray-700">First Name</label>
        <input
          id="first_name"
          name="first_name"
          placeholder="First Name"
          value={form.first_name}
          onChange={handleChange}
          required
          className="p-2 border border-gray-300 rounded h-[40px]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="last_name" className="text-sm font-medium text-gray-700">Last Name</label>
        <input
          id="last_name"
          name="last_name"
          placeholder="Last Name"
          value={form.last_name}
          onChange={handleChange}
          required
          className="p-2 border border-gray-300 rounded h-[40px]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="p-2 border border-gray-300 rounded h-[40px]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="plain_password" className="text-sm font-medium text-gray-700">Password</label>
        <input
          id="plain_password"
          name="plain_password"
          placeholder="Password"
          type="password"
          value={form.plain_password}
          onChange={handleChange}
          // Only require password if not editing (i.e., creating)
          required={editingId === null}
          className="p-2 border border-gray-300 rounded h-[40px]"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="role_id" className="text-sm font-medium text-gray-700">Role</label>
        <select
          id="role_id"
          name="role_id"
          value={form.role_id || ''}
          onChange={handleChange}
          className="p-2 border border-gray-300 rounded h-[40px]"
          required
        >
          <option value="" disabled hidden>
            Select Role
          </option>
          {roles.map((role) => (
            <option key={role.role_id} value={role.role_id}>
              {role.role_name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-end justify-end gap-2">
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

export default UserForm;
