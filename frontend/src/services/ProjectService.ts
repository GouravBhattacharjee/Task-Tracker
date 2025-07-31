import axiosInstance from './AxiosInstance';

export type ProjectModel = {
    project_id: number
    project_name: string;
    project_description: string;
    project_start_date: string;
    project_end_date: string;
    owner_id: number;
    project_active: boolean;
    created_by_email: string;
    modified_by_email: string;
};

export const fetchProjects = async () => {
  const response = await axiosInstance.get(`/api/projects`);
  return response.data;
};

export const fetchProjectByID = async (project_id: number) => {
  const response = await axiosInstance.get(`/api/projects/${project_id}`);
  return response.data;
};

export const createProject = async (payload: Omit<ProjectModel, 'project_id' | 'project_active'>) => {
  const response = await axiosInstance.post(`/api/projects`, payload);
  return response.data;
};

export const updateProject = async (payload: Partial<ProjectModel> & Required<Pick<ProjectModel, 'project_id' | 'modified_by_email'>>) => {
  const response = await axiosInstance.post(`/api/update_project`, payload);
  return response.data;
};
