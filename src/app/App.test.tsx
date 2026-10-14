import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { App } from './App.tsx'

describe('App', () => {
  it('redirige al login sin sesión', async () => {
    render(<App />)

    expect(
      await screen.findByRole('heading', { name: /bienvenido al laboratorio/i }),
    ).toBeInTheDocument()
  })
})
