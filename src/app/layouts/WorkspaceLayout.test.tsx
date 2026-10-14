import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'

import { WorkspaceLayout } from './WorkspaceLayout.tsx'
import { useSessionStore } from '../../features/authentication/hooks/useSessionStore.ts'

function renderWorkspace() {
  render(
    <MemoryRouter initialEntries={['/perfil']}>
      <Routes>
        <Route element={<WorkspaceLayout />}>
          <Route path="/perfil" element={<p>Contenido</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('WorkspaceLayout', () => {
  it('muestra tabs, usuario y botón cerrar sesión', () => {
    useSessionStore.getState().loginBasic('ana@lab.test', 'x', {
      id: '1',
      name: 'Ana Torres',
      email: 'ana@lab.test',
      is_active: true,
    })
    renderWorkspace()

    expect(screen.getByText('AuthLab')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /inicio/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /perfil/i })).toBeInTheDocument()
    expect(screen.getByText('Ana Torres')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /cerrar sesión/i }),
    ).toBeInTheDocument()
    useSessionStore.getState().logout()
  })

  it('cerrar sesión limpia el store', async () => {
    const user = userEvent.setup()
    useSessionStore.getState().loginBasic('ana@lab.test', 'x', {
      id: '1',
      name: 'Ana Torres',
      email: 'ana@lab.test',
      is_active: true,
    })
    renderWorkspace()

    await user.click(screen.getByRole('button', { name: /cerrar sesión/i }))

    expect(useSessionStore.getState().user).toBeNull()
  })
})
