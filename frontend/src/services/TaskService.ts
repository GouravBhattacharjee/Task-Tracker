import axiosInstance from "./AxiosInstance";

export type TaskModel = {
  task_id: number;
  task_description: string;
  task_due_date: string;
  task_status_id: number;
  owner_id: number;
  project_id: number;
  task_active: boolean;
  created_by_email: string;
  modified_by_email: string;
};

export const fetchTasks = async () => {
  const response = await axiosInstance.get(`/api/tasks`);
  return response.data;
};

export const fetchTaskByID = async (task_id: number) => {
  const response = await axiosInstance.get(`/api/tasks/${task_id}`);
  return response.data;
};

export const createTask = async (
  payload: Omit<TaskModel, "task_id" | "task_active">
) => {
  const response = await axiosInstance.post(`/api/tasks`, payload);
  return response.data;
};

export const updateTask = async (
  payload: Partial<TaskModel> &
    Required<Pick<TaskModel, "task_id" | "modified_by_email">>
) => {
  const response = await axiosInstance.post(`/api/update_task`, payload);
  return response.data;
};

export const updateTaskStatusInTask = async (
  payload: Required<
    Pick<TaskModel, "task_id" | "task_status_id" | "modified_by_email">
  >
) => {
  const response = await axiosInstance.post(
    `/api/update_taskstatus_in_task`,
    payload
  );
  return response.data;
};

export const fetchTasksByProjectID = async (project_id: number) => {
  const response = await axiosInstance.get(`/api/projects/${project_id}/tasks`);
  return response.data;
};
