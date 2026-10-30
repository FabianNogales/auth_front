import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { CreateExperimentForm } from './CreateExperimentForm.tsx'

const users = [{ id: '42', name: 'Sujeto', email: 'subject@lab.test', is_active: true }]

it('muestra los mensajes exactos y no crea con campos vacíos', async () => {
  const create = vi.fn()
  render(<CreateExperimentForm users={users} onCreate={create} />)
  fireEvent.click(screen.getByRole('button', { name: 'Crear experimento' }))
  expect(await screen.findByText('El nombre del experimento es obligatorio')).toBeInTheDocument()
  expect(screen.getByText('Debe seleccionar un mecanismo')).toBeInTheDocument()
  expect(screen.getByText('Debe seleccionar un usuario de prueba')).toBeInTheDocument()
  expect(create).not.toHaveBeenCalled()
})

it('mapea OAuth, conserva el ID de usuario y envía el recurso seleccionado', async () => {
  const create = vi.fn().mockResolvedValue({})
  render(<CreateExperimentForm users={users} onCreate={create} />)
  fireEvent.change(screen.getByLabelText('Nombre del experimento'), { target: { value: '  Comparación  ' } })
  fireEvent.change(screen.getByLabelText('Mecanismo de autenticación'), { target: { value: 'oauth' } })
  fireEvent.change(screen.getByLabelText('Usuario de prueba'), { target: { value: '42' } })
  fireEvent.click(screen.getByLabelText('Listado de tickets'))
  fireEvent.click(screen.getByRole('button', { name: 'Crear experimento' }))
  await waitFor(() => expect(create).toHaveBeenCalledWith({ name: 'Comparación', mechanism: 'oauth', test_user_id: '42', resources: ['tickets.list'] }))
})
