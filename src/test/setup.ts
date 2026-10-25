import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import 'whatwg-fetch'

vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ user: { id: '1', name: 'Ana', email: 'ana@lab.test', is_active: true }, roles: [{ name: 'EDITOR' }, { name: 'VIEWER' }] }),
}))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
