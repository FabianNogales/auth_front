import { RouterProvider, createBrowserRouter } from 'react-router'

import { ProtectedRoute } from '../../features/authentication/components/ProtectedRoute.tsx'
import { RootLayout } from '../layouts/RootLayout.tsx'
import { WorkspaceLayout } from '../layouts/WorkspaceLayout.tsx'
import { BasicLoginPage } from '../../features/authentication/pages/BasicLoginPage.tsx'
import { JwtLoginPage } from '../../features/authentication/pages/JwtLoginPage.tsx'
import { LabHomePage } from '../../features/experiments/pages/LabHomePage.tsx'
import { ProfilePage } from '../../features/users/pages/ProfilePage.tsx'
import { NotFoundPage } from './NotFoundPage.tsx'
import { ApiKeysPage } from '../../features/authentication/pages/ApiKeysPage.tsx'
import { OAuthIssuePage } from '../../features/authentication/pages/OAuthIssuePage.tsx'
import { OAuthRevokePage } from '../../features/authentication/pages/OAuthRevokePage.tsx'
import { OAuthRequestPage } from '../../features/authentication/pages/OAuthRequestPage.tsx'
import { OAuthRefreshPage } from '../../features/authentication/pages/OAuthRefreshPage.tsx'

import { CreateRolePage } from '../../features/roles/pages/CreateRolePage.tsx'
import { RolePermissionsPage } from '../../features/roles/pages/RolePermissionsPage.tsx'
import { UserRolesPage } from '../../features/users/pages/UserRolesPage.tsx'
import { UsersPage } from '../../features/users/pages/UsersPage'

import { TicketsPage } from '../../features/tickets/pages/TicketsPage.tsx'
import { CreateTicketPage } from '../../features/tickets/pages/CreateTicketPage.tsx'
import { TicketDetailPage } from '../../features/tickets/pages/TicketDetailPage.tsx'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <BasicLoginPage />,
  },
  {
    path: '/login/jwt',
    element: <JwtLoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <WorkspaceLayout />
      </ProtectedRoute>
    ),
    children: [
      
      { path: 'roles/crear', element: <CreateRolePage /> },
      { path: 'roles/permisos', element: <RolePermissionsPage /> },
      { path: 'roles/:name/permisos', element: <RolePermissionsPage /> },
      { path: 'usuarios/roles', element: <UserRolesPage /> },
      { path: 'usuarios/:userId/roles', element: <UserRolesPage /> },
      { path: 'api-keys', element: <ApiKeysPage /> },
      { path: 'oauth/emitir', element: <OAuthIssuePage /> },
      { path: 'oauth/revocar', element: <OAuthRevokePage /> },
      { path: 'oauth/solicitud', element: <OAuthRequestPage /> },
      { path: 'oauth/renovar', element: <OAuthRefreshPage /> },
      { path: 'usuarios/:userId/api-keys', element: <ApiKeysPage /> },
      { path: 'usuarios', element: <UsersPage />, },

      { path: 'tickets', element: <TicketsPage /> },
      { path: 'tickets/nuevo', element: <CreateTicketPage /> },
      { path: 'tickets/:ticketId', element: <TicketDetailPage /> },
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