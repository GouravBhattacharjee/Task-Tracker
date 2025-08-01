import axios from "axios";
import axiosInstance from "./AxiosInstance";
import { BACKEND_BASE_URL } from "../config";

type LoginModel = {
  email: string;
  plain_password: string;
};

type RegisterModel = {
  first_name: string;
  last_name: string;
  email: string;
  provider: string;
  plain_password: string;
  role_id: number;
  created_by_email?: string;
  modified_by_email?: string;
};

export const userLogin = async (payload: LoginModel) => {
  const response = await axios.post(`${BACKEND_BASE_URL}/api/login`, payload, {
    withCredentials: true,
  });
  return response.data;
};

export const userRegister = async (payload: RegisterModel) => {
  const response = await axios.post(
    `${BACKEND_BASE_URL}/api/register`,
    payload
  );
  return response;
};

export const userForgotPassword = async (payload: { email: string }) => {
  const response = await axiosInstance.post(`/api/forgot-password`, payload);
  return response.data;
};

export const refreshToken = async () => {
  const response = await axios.post(
    `${BACKEND_BASE_URL}/api/refresh-token`,
    null,
    {
      withCredentials: true, // ensure cookies are sent
    }
  );
  return response.data;
};

export const userGoogleLogin = async (token: string) => {
  const payload = { token };
  const response = await axios.post(
    `${BACKEND_BASE_URL}/api/login/google`,
    payload,
    {
      withCredentials: true,
    }
  );
  return response.data;
};
