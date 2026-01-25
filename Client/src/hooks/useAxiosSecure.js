import axios from 'axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

const secureInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export function useAxiosSecure() {
  const navigate = useNavigate();

  useEffect(function () {
    const resIntercepter = secureInstance.interceptors.response.use(
      response => {
        return response;
      },
      error => {
        console.log(error);
      },
    );

    return () => {
      secureInstance.interceptors.response.eject(resIntercepter);
    };
  }, []);
  return secureInstance;
}
