import { Link } from 'react-router';

export default function HomePage() {
  return (
    <div>
      <h1 className='text-5xl mb-5'>HomePage</h1>
      <div className='flex gap-5 justify-between'>
        <Link
          className='py-2 px-5 bg-orange-400 text-white rounded-md'
          to='/register'>
          Register
        </Link>
        <Link
          className='py-2 px-5 bg-green-400 text-white rounded-md'
          to='/login'>
          Login
        </Link>
      </div>
    </div>
  );
}
