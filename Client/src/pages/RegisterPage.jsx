import { useMutation } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { useAxiosSecure } from '../hooks/useAxiosSecure';
export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm();
  const password = useWatch({ control, name: 'password', defaultValue: '' });

  const axiosSecure = useAxiosSecure();

  const { mutate, isPending } = useMutation({
    mutationFn: async data => {
      const res = await axiosSecure.post('/users', data);
      return res.data;
    },
    onSuccess: data => {
      console.log('Registration is successful', data);
      reset();
    },
    onError: error => {
      console.error('Registration failed', error);
    },
  });

  function handleRegisterForm(data) {
    console.log(data);
    mutate(data);
  }
  return (
    <div>
      <h1>Register Page</h1>

      <form
        action=''
        className='space-y-2'
        onSubmit={handleSubmit(handleRegisterForm)}>
        {/* Name */}
        <div className='flex gap-2 items-center'>
          <label htmlFor='name'>Name:</label>
          <input
            className='py-1 border'
            type='text'
            id='name'
            placeholder='Name'
            {...register('name', {
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
            })}
          />
          {errors.name && <p className='text-red-500'>{errors.name.message}</p>}
        </div>
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
        {/* Confirm Password */}
        <div className='flex gap-2 items-center'>
          <label htmlFor='pass'>Confirm Password:</label>
          <input
            className='py-1 border'
            type='password'
            id='pass'
            placeholder='****'
            {...register('confirmPassword', {
              required: 'Confirm Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
              validate: value =>
                value === password || 'Password do not matched',
            })}
          />
          {errors.confirmPassword && (
            <p className='text-red-500'>{errors.confirmPassword.message}</p>
          )}
        </div>
        <button
          disabled={isPending}
          className='py-2 px-5 bg-green-400 text-white rounded-md'>
          Register
        </button>
      </form>
    </div>
  );
}
