import axiosInstance from './AxiosInstance';

export type TaskStatusModel = {
    task_status_id: number;
    task_status_name: string;
    task_status_active: boolean;
    created_by_email: string;
    modified_by_email: string;
}

export const fetchTaskStatuses = async () => {
  const response = await axiosInstance.get(`/api/taskstatus`);
  return response.data;
};

export const fetchTaskStatusByID = async (task_status_id: number) => {
  const response = await axiosInstance.get(`/api/taskstatus/${task_status_id}`);
  return response.data;
};

export const createTaskStatus = async (payload: Omit<TaskStatusModel, 'task_status_id' | 'task_status_active'>) => {
  const response = await axiosInstance.post(`/api/taskstatus`, payload);
  return response.data;
};

export const updateTaskStatus = async (payload: Partial<TaskStatusModel> & Required<Pick<TaskStatusModel, 'task_status_id' | 'modified_by_email'>>) => {
  const response = await axiosInstance.post(`/api/update_taskstatus`, payload);
  return response.data;
};
