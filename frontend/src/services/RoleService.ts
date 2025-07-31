import axiosInstance from './AxiosInstance';

export type RoleModel = {
    role_id: number;
    role_name: string;
    role_permissions: string;
    role_active: boolean;
    created_by_email: string;
    modified_by_email: string;
};

export const fetchRoles = async () => {
  const response = await axiosInstance.get(`/api/roles`);
  return response.data;
};

export const fetchRoleByID = async (role_id: number) => {
  const response = await axiosInstance.get(`/api/roles/${role_id}`);
  return response.data;
};

export const createRole = async (payload: Omit<RoleModel, 'role_id' | 'role_active'>) => {
  const response = await axiosInstance.post(`/api/roles`, payload);
  return response.data;
};

export const updateRole = async (payload: Partial<RoleModel> & Required<Pick<RoleModel, 'role_id' | 'modified_by_email'>>) => {
  const response = await axiosInstance.post(`/api/update_role`, payload);
  return response.data;
};

export const fetchRolePermissions = async () => {
  const response = await axiosInstance.get(`/api/rolepermissions`);
  return response.data;
};