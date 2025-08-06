import AxiosInstance from "./AxiosInstance";

export type UserModel = {
  user_id: number;
  plain_password: string;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
  user_active: boolean;
  created_by_email: string;
  modified_by_email: string;
};

export const fetchUsers = async () => {
  const response = await AxiosInstance.get(`/api/users`);
  return response.data;
};

export const fetchUserByID = async (user_id: number) => {
  const response = await AxiosInstance.get(`/api/users/${user_id}`);
  return response.data;
};

export const updateUser = async (
  payload: Partial<UserModel> &
    Required<Pick<UserModel, "user_id" | "modified_by_email">>
) => {
  const response = await AxiosInstance.post(`/api/update_user`, payload);
  return response.data;
};
