import { Outlet } from 'react-router';

export default function RootLayout() {
  return (
    <div className='flex justify-center items-center min-h-dvh'>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
