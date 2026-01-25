import axios from 'axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

const secureInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export function useAxiosSecure() {
  const navigate = useNavigate();

  useEffect(
    function () {
      const resIntercepter = secureInstance.interceptors.response.use(
        response => response,
        async error => {
          console.log('Error of Interceptor:', error);
          const originalRequest = error.config;
          const statusCode = error.response ? error.response.status : null;

          if (statusCode === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
              const res = await secureInstance.post('/users/refresh-token');
              if (res.data.success) {
                return secureInstance(originalRequest);
              }
            } catch (refreshError) {
              console.error('Refresh token failed', refreshError);
              navigate('/login');
            }
          } else if (statusCode === 401 || statusCode === 403) {
            navigate('/login');
          }
          return Promise.reject(error);
        }
      );

      return () => {
        secureInstance.interceptors.response.eject(resIntercepter);
      };
    },
    [navigate],
  );
  return secureInstance;
}
