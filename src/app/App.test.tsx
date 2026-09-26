import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { App } from './App.tsx'

describe('App', () => {
  it('renders the initial laboratory page', async () => {
    render(<App />)

    expect(
      await screen.findByRole('heading', { name: /autenticación lab/i }),
    ).toBeInTheDocument()
  })
})
