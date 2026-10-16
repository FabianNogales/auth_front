import { RouterProvider, createBrowserRouter } from 'react-router'

import { ProtectedRoute } from '../../features/authentication/components/ProtectedRoute.tsx'
import { RootLayout } from '../layouts/RootLayout.tsx'
import { WorkspaceLayout } from '../layouts/WorkspaceLayout.tsx'
import { BasicLoginPage } from '../../features/authentication/pages/BasicLoginPage.tsx'
import { LabHomePage } from '../../features/experiments/pages/LabHomePage.tsx'
import { ProfilePage } from '../../features/users/pages/ProfilePage.tsx'
import { NotFoundPage } from './NotFoundPage.tsx'
import { ApiKeysPage } from '../../features/authentication/pages/ApiKeysPage.tsx'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <BasicLoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <WorkspaceLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'api-keys', element: <ApiKeysPage /> },
      { path: 'usuarios/:userId/api-keys', element: <ApiKeysPage /> },
      {
        index: true,
        element: (
          <RootLayout>
            <LabHomePage />
          </RootLayout>
        ),
      },
      {
        path: 'perfil',
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
