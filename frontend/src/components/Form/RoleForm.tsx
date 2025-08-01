import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

interface RoleFormProps {
  form: {
    role_name: string;
    permissions: string[];
  };
  allPermissions: string[];
  editingId: number | null;
  loading: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePermissionToggle: (perm: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleCancel: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({
  form,
  allPermissions,
  editingId,
  loading,
  handleChange,
  handlePermissionToggle,
  handleSubmit,
  handleCancel,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuth();
  const canCreate = user?.role_permissions_parsed.includes("create_role");

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
      <div className="flex gap-4 w-full items-end">
        <div className="flex flex-col flex-1 gap-1">
          <label
            htmlFor="role_name"
            className="text-sm font-medium text-gray-700"
          >
            Role Name
          </label>
          <input
            id="role_name"
            name="role_name"
            placeholder="Role Name"
            value={form.role_name}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded h-[40px]"
          />
        </div>

        <div className="flex flex-col flex-1 gap-2 relative" ref={dropdownRef}>
          <label className="text-sm font-medium text-gray-700">
            Permissions
          </label>

          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full border border-gray-300 rounded p-2 text-left bg-white"
          >
            {form.permissions.length > 0
              ? `${form.permissions.length} selected`
              : "Select Permissions"}
          </button>

          {dropdownOpen && (
            <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-40 overflow-y-auto z-10">
              {allPermissions.map((perm) => (
                <label
                  key={perm}
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.permissions.includes(perm)}
                    onChange={() => handlePermissionToggle(perm)}
                    className="w-4 h-4"
                  />
                  {perm}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-2 self-start">
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

export default RoleForm;
