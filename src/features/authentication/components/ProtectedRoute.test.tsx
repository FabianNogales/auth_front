import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'

import { ProtectedRoute } from './ProtectedRoute.tsx'
import { useSessionStore } from '../hooks/useSessionStore.ts'
import type { LabUser } from '../types/auth.ts'

const user: LabUser = {
  id: '1',
  name: 'Ana',
  email: 'ana@lab.test',
  is_active: true,
}

function renderWithRoute(roles?: string[]) {
  render(
    <MemoryRouter initialEntries={['/privada']}>
      <Routes>
        <Route
          path="/privada"
          element={
            <ProtectedRoute roles={roles}>
              <p>Contenido privado</p>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<p>Página de login</p>} />
        <Route path="/" element={<p>Inicio</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('redirige al login sin sesión', () => {
    useSessionStore.getState().logout()
    renderWithRoute()

    expect(screen.getByText('Página de login')).toBeInTheDocument()
  })

  it('muestra el contenido con sesión', () => {
    useSessionStore.getState().loginBasic('ana@lab.test', 'x', user)
    renderWithRoute()

    expect(screen.getByText('Contenido privado')).toBeInTheDocument()
    useSessionStore.getState().logout()
  })

  it('niega tabs con rol no coincidente', () => {
    useSessionStore.getState().loginBasic('ana@lab.test', 'x', user)
    useSessionStore.getState().setRoles(['VIEWER'])
    renderWithRoute(['ADMIN'])

    expect(screen.getByText('Inicio')).toBeInTheDocument()
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument()
    useSessionStore.getState().logout()
  })
})
