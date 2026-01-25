import { createBrowserRouter } from 'react-router';
import RootLayout from '../layouts/RootLayout';
import Dashboard from '../pages/Dashboard';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';

const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: HomePage,
      },
      {
        path: 'register',
        Component: RegisterPage,
      },
      {
        path: 'login',
        Component: LoginPage,
      },
      {
        path: 'dashboard',
        Component: Dashboard,
      },
    ],
  },
]);

export default router;
