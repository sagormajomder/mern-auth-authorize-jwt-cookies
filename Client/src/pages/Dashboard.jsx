import { useQuery } from '@tanstack/react-query';
import { useAxiosSecure } from '../hooks/useAxiosSecure';

export default function Dashboard() {
  const axiosSecure = useAxiosSecure();
  const { data = {} } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await axiosSecure.get('/users/me?email=demo@gmail.com');
      return res.data;
    },
  });
  console.log(data);
  return (
    <div>
      <h1>Name: {data?.name}</h1>
      <p>Role: {data?.role}</p>
    </div>
  );
}
