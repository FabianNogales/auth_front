# Autenticación Lab — Frontend

Laboratorio telemático para evaluar experimentalmente mecanismos de autenticación ante cambios dinámicos de privilegios.

Este frontend forma parte de un proyecto académico. No busca ser un sistema empresarial terminado, sino una interfaz experimental separada del backend Laravel, orientada a comparar el comportamiento de credenciales cuando cambian los privilegios de un usuario durante la ejecución.

## Tabla de contenidos

- [Stack técnico](#stack-técnico)
- [Arquitectura](#arquitectura)
- [Módulos previstos](#módulos-previstos)
- [Estructura de carpetas](#estructura-de-carpetas)
- [Flujo de una operación](#flujo-de-una-operación)
- [Cliente HTTP](#cliente-http)
- [Estado](#estado)
- [Cómo implementar un módulo nuevo](#cómo-implementar-un-módulo-nuevo)
- [Testing](#testing)
- [Variables de entorno](#variables-de-entorno)
- [Instalación y ejecución](#instalación-y-ejecución)
- [Integración con backend](#integración-con-backend)
- [Roadmap inicial](#roadmap-inicial)
- [Convenciones de código](#convenciones-de-código)
- [Antes de hacer commit](#antes-de-hacer-commit)
- [Referencias](#referencias)

## Stack técnico

| Componente | Versión instalada | Uso en el proyecto |
| --- | --- | --- |
| React | 19.3.0 | Construcción de interfaz y componentes. |
| TypeScript | 6.0.3 | Tipado estático del frontend. |
| Vite | 8.3.1 | Servidor de desarrollo y build. |
| React Router | 7.18.4 | Enrutamiento de la aplicación. |
| Axios | 1.20.0 | Cliente HTTP base para REST/JSON. |
| TanStack Query | 5.104.0 | Estado proveniente del servidor. |
| React Hook Form | 7.89.0 | Formularios futuros del laboratorio. |
| Zod | 4.6.5 | Validación de esquemas futuros. |
| @hookform/resolvers | 5.9.1 | Integración entre React Hook Form y Zod. |
| CSS Modules | Nativo de Vite | Estilos encapsulados por componente. |
| Recharts | 3.10.1 | Gráficos futuros de métricas y comparación. |
| Vitest | 4.1.11 | Pruebas unitarias y de componentes. |
| React Testing Library | 16.3.3 | Pruebas orientadas al comportamiento de UI. |
| Playwright | 1.63.0 | Pruebas E2E futuras. |

## Arquitectura

### Feature-Based Architecture en una frase

El código se organiza alrededor de funcionalidades del laboratorio y cada módulo encapsula su interfaz, estado, acceso a servicios y tipos.

El backend usa Clean Architecture porque concentra reglas de dominio, casos de uso e infraestructura. El frontend se mantiene más ligero: aquí conviene priorizar composición de UI, módulos por funcionalidad, servicios explícitos y bajo acoplamiento sin replicar capas innecesarias.

### Principios

- Modularidad por funcionalidad.
- Separación clara entre UI, hooks, services y tipos.
- Comunicación HTTP centralizada en `shared/services/httpClient.ts`.
- Bajo acoplamiento entre features.
- `shared` sólo para elementos realmente reutilizables.
- Evitar sobreingeniería mientras el laboratorio evoluciona.

### Dirección de dependencias

```text
app
 ↓
features
 ↓
shared
```

`app` compone providers, router, layouts y configuración global. `features` contiene la funcionalidad del laboratorio. Un feature puede usar `shared`, pero debe evitar importar archivos internos de otro feature. Si un feature necesita exponer algo a otro módulo, debe hacerlo mediante una interfaz pública clara. `shared` no debe depender de `features`.

## Módulos previstos

- `authentication`: integración futura de API Key, Basic Authentication, JWT y OAuth 2.0.
- `users`: identidades de prueba utilizadas en el laboratorio.
- `access-control`: roles, permisos y cambios dinámicos de privilegios.
- `experiments`: ejecución de escenarios experimentales.
- `metrics`: visualización y comparación de resultados.

## Estructura de carpetas

```text
src/
├── app/
│   ├── layouts/
│   ├── providers/
│   ├── router/
│   ├── App.test.tsx
│   └── App.tsx
├── features/
│   ├── access-control/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── authentication/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── experiments/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── metrics/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   └── users/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       └── types/
├── shared/
│   ├── components/
│   ├── constants/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   └── utils/
├── styles/
│   ├── globals.css
│   └── variables.css
├── test/
│   └── setup.ts
└── main.tsx
```

Las carpetas aún vacías incluyen `.gitkeep` para conservar el scaffold inicial.

## Flujo de una operación

```text
Component/Page
      ↓
Hook
      ↓
Service
      ↓
HTTP Client
      ↓
Laravel API
```

Las pages componen pantallas. Los components renderizan UI. Los custom hooks coordinan estado de UI, loading, error, acciones e integración con TanStack Query. Los services realizan comunicación HTTP y transformaciones simples sin comportamiento visual. El HTTP client compartido concentra la configuración base de Axios.

## Cliente HTTP

El cliente HTTP vive en `src/shared/services/httpClient.ts` y usa Axios con `VITE_API_URL` como `baseURL`.

Importante: `httpClient` es neutral. No agrega automáticamente Bearer Token, API Key, Basic Authentication ni ninguna credencial global mediante interceptores. Este laboratorio debe comparar mecanismos distintos, por lo que cada service de autenticación decidirá explícitamente qué headers enviar cuando esa fase sea implementada.

## Estado

- React local state para estado estrictamente local de componentes.
- Custom hooks para coordinar lógica de UI de cada feature.
- TanStack Query para server state: usuarios, roles, permisos, resultados, historial y métricas.
- Context sólo si aparece estado global realmente justificable.
- Redux no se usa inicialmente porque agregaría complejidad innecesaria.

## Cómo implementar un módulo nuevo

1. Crear o reutilizar el feature correspondiente.
2. Definir `types` del módulo sin inventar DTOs no confirmados.
3. Crear un `service` para comunicación HTTP.
4. Crear un hook `useNombre` si hay estado o coordinación de acciones.
5. Crear components pequeños.
6. Crear una page si corresponde a una ruta.
7. Registrar la ruta en `src/app/router/`.
8. Agregar pruebas enfocadas.

Ejemplo:

```text
src/features/example/
├── components/
│   └── ExampleSummary.tsx
├── hooks/
│   └── useExample.ts
├── pages/
│   └── ExamplePage.tsx
├── services/
│   └── exampleService.ts
└── types/
    └── example.ts
```

## Testing

Vitest está configurado con entorno `jsdom` y setup global en `src/test/setup.ts`. React Testing Library se usa para comprobar comportamiento observable por el usuario.

Playwright queda preparado para E2E en `playwright.config.ts`. La instalación de navegadores no se ejecuta automáticamente; cuando se necesite correr E2E por primera vez:

```bash
npx playwright install
```

Comandos:

```bash
npm run test
npm run test:run
npm run test:e2e
```

## Variables de entorno

Variable disponible:

```text
VITE_API_URL=http://127.0.0.1:8000/api
```

Crear un entorno local copiando `.env.example` a `.env`. No versionar secretos ni credenciales reales.

## Instalación y ejecución

Versiones detectadas localmente:

- Node.js: `v20.19.0`
- npm: `10.8.2`

Comandos principales:

```bash
npm install
npm run dev
npm run build
npm run lint
npm run test:run
```

## Integración con backend

El backend vive en un repositorio separado y expone una API REST/JSON. La URL se configura mediante `VITE_API_URL`. Los endpoints se integrarán cuando exista un contrato definido del backend; este scaffold no inventa rutas.

## Roadmap inicial

1. Scaffold y arquitectura frontend.
2. Diseño base de interfaz.
3. Módulo users.
4. Módulo access-control.
5. API Key.
6. Basic Authentication.
7. JWT.
8. OAuth 2.0.
9. Experimentos.
10. Métricas y gráficos.
11. Tests E2E.
12. Documentación final.

Estado actual: esta base completa únicamente el scaffold inicial.

## Convenciones de código

- Archivos y componentes React en `PascalCase`.
- Hooks con formato `useNombre`.
- Services en `camelCase`.
- Tipos e interfaces en `PascalCase`.
- Funciones y variables en `camelCase`.
- Código y nombres técnicos en inglés.
- Documentación y comentarios explicativos en español.
- Evitar lógica HTTP directa en components.
- Evitar duplicación.
- No mover algo a `shared` hasta que exista reutilización real.
- Mantener componentes pequeños.
- Usar imports claros.

## Antes de hacer commit

Ejecutar:

```bash
npm run lint
npm run test:run
npm run build
```

Todo debe quedar verde antes de crear un commit.

## Referencias

- React
- Vite
- TypeScript
- TanStack Query
- React Router
