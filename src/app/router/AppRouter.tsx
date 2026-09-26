import { RouterProvider, createBrowserRouter } from 'react-router'

import { RootLayout } from '../layouts/RootLayout.tsx'
import { LabHomePage } from '../../features/experiments/pages/LabHomePage.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <RootLayout>
        <LabHomePage />
      </RootLayout>
    ),
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
