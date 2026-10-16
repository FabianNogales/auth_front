import { useState } from 'react'
import { apiKeyService } from '../services/apiKeyService'

export function ApiKeyAuthTest() {
  const [apiKey, setApiKey] = useState('')
  const [result, setResult] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSendRequest = async () => {
    setLoading(true)
    setResult(null)
    setIsError(false)

    if (!apiKey.trim()) {
      setResult('No autenticado')
      setIsError(true)
      setLoading(false)
      return
    }

    try {
      const data = await apiKeyService.testProtected(apiKey)
      
      // Transformamos la respuesta técnica en un mensaje humano y amigable
      if (data && typeof data === 'object' && (data as any).message === 'OK') {
        setResult('¡Autenticación exitosa! Acceso concedido al recurso protegido.')
      } else {
        setResult(JSON.stringify(data, null, 2))
      }
    } catch {
      setResult('No autenticado')
      setIsError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <h2>Probar Autenticación con API Key</h2>
      <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
        Ingresa una clave para verificar el acceso a recursos protegidos.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', width: '100%' }}>
        <label htmlFor="api-key-test-input" style={{ fontWeight: '600' }}>
          API Key
        </label>
        <input
          id="api-key-test-input"
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Pega aquí tu API Key completa..."
          style={{
            padding: '0.6rem',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '0.9rem',
            fontFamily: 'monospace',
            width: '100%',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <button
        type="button"
        onClick={handleSendRequest}
        disabled={loading}
        style={{
          padding: '0.6rem 1.2rem',
          backgroundColor: '#2563eb',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Verificando...' : 'Enviar solicitud'}
      </button>

      {result !== null && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Respuesta del sistema:</h3>
          <div
            role="alert"
            style={{
              padding: '1rem 1.2rem',
              borderRadius: '6px',
              backgroundColor: isError ? '#fef2f2' : '#f0fdf4',
              color: isError ? '#991b1b' : '#166534',
              border: `1px solid ${isError ? '#fecaca' : '#bbf7d0'}`,
              fontFamily: isError ? 'monospace' : 'inherit',
              fontSize: '0.95rem',
              fontWeight: isError ? 'normal' : '500',
              maxWidth: '600px',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}
          >
            {result}
          </div>
        </div>
      )}
    </div>
  )
}