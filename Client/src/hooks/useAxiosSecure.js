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
        error => {
          console.log('Error of Interceptor:', error);
          const statusCode = error.response.status;
          console.log(statusCode);

          if (statusCode === 401 || statusCode === 403) {
            console.log('Authentication failed');

            navigate('/login');
          }
        },
      );

      return () => {
        secureInstance.interceptors.response.eject(resIntercepter);
      };
    },
    [navigate],
  );
  return secureInstance;
}
