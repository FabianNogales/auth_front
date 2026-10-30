export const AUTHENTICATION_METHODS = [
  'API_KEY',
  'BASIC',
  'JWT',
  'OAUTH2',
] as const

export const AUTHENTICATION_API_VALUES = {
  API_KEY: 'api_key',
  BASIC: 'basic',
  JWT: 'jwt',
  OAUTH2: 'oauth',
} as const satisfies Record<(typeof AUTHENTICATION_METHODS)[number], string>

export const AUTHENTICATION_LABELS = {
  API_KEY: 'API Key',
  BASIC: 'Basic Authentication',
  JWT: 'JWT',
  OAUTH2: 'OAuth 2.0',
} as const satisfies Record<(typeof AUTHENTICATION_METHODS)[number], string>
