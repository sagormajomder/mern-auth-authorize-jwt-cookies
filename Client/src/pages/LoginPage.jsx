import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { useAxiosSecure } from '../hooks/useAxiosSecure';

export default function LoginPage() {
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const { mutate, isPending } = useMutation({
    mutationFn: async formData => {
      const res = await axiosSecure.post('/users/login', formData);
      return res.data;
    },
    onSuccess: data => {
      console.log('Login Successfully', data);
      reset();
      navigate('/dashboard');
    },
    onError: error => {
      console.log('Login failed', error);
    },
  });

  function handleLoginForm(data) {
    console.log(data);
    mutate(data);
  }
  return (
    <div>
      <h1>Login Page</h1>

      <form
        action=''
        className='space-y-2 mb-5'
        onSubmit={handleSubmit(handleLoginForm)}>
        {/* Email */}
        <div className='flex gap-2 items-center'>
          <label htmlFor='email'>Email:</label>
          <input
            className='py-1 border'
            type='email'
            id='email'
            placeholder='Email'
            {...register('email', { required: 'Email is required' })}
          />
          {errors.email && (
            <p className='text-red-500'>{errors.email.message}</p>
          )}
        </div>
        {/* Password */}
        <div className='flex gap-2 items-center'>
          <label htmlFor='pass'>Password:</label>
          <input
            className='py-1 border'
            type='password'
            id='pass'
            placeholder='****'
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
            })}
          />
          {errors.password && (
            <p className='text-red-500'>{errors.password.message}</p>
          )}
        </div>

        <button
          disabled={isPending}
          className='py-2 px-5 bg-green-400 text-white rounded-md'>
          Login
        </button>
      </form>
      <Link
        className='py-2 px-5 bg-orange-400 text-white rounded-md'
        to='/register'>
        Register here
      </Link>
    </div>
  );
}
