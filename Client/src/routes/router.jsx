import { createBrowserRouter } from 'react-router';
import RootLayout from '../layouts/RootLayout';
import HomePage from '../pages/HomePage';

const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: HomePage,
      },
    ],
  },
]);

export default router;
