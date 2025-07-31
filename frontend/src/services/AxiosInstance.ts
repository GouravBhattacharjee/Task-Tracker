import axios from 'axios';
import { BACKEND_BASE_URL } from '../config';
import { refreshToken } from '../services/AuthService';
import { getToken, setToken } from './TokenStore';

const AxiosInstance = axios.create({
  baseURL: BACKEND_BASE_URL,
});

// Attach access token to requests
AxiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 (expired access token)
AxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Refresh token (from secure HttpOnly cookie)
        const data = await refreshToken();

        // Update in-memory token
        setToken(data.access_token);

        // Retry request
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return AxiosInstance(originalRequest);
      } catch (err) {
        // Refresh failed: logout
        (window as any).logout ? (window as any).logout() : window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default AxiosInstance;

// import axios from 'axios';
// import { BACKEND_BASE_URL } from '../config';
// import { refreshToken } from '../services/AuthService';

// const AxiosInstance = axios.create({
//   baseURL: BACKEND_BASE_URL,
// });

// // Attach access token to normal requests
// AxiosInstance.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Handle 401 responses (expired access token)
// AxiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         // Request refresh token (cookie sent here)
//         const data = await refreshToken();

//         // Save new access token
//         localStorage.setItem('token', data.access_token);

//         // Retry original request
//         originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
//         return AxiosInstance(originalRequest);
//       } catch (err) {
//         // If Refresh failed, logout and redirect
//         (window as any).logout ? (window as any).logout() : window.location.href = '/login';
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default AxiosInstance;
