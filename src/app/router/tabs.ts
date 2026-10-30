/**
 * Registro central de tabs del workspace.
 *
 * Otros devs agregan páginas aquí: una entrada = un item del sidebar.
 * `permissions` filtra por permisos efectivos del usuario (vacío = solo exige
 * sesión). `mechanisms` filtra por el mecanismo de autenticación activo
 * (vacío = se muestra con cualquier mecanismo). La autorización real siempre
 * la decide el backend por request.
 *
 * Modelo de permisos: `ADMIN`, `DELETE`, `READ`, `WRITE`. Los roles son
 * dinámicos (el backend permite crear roles custom) así que el filtro se hace
 * por permisos, no por nombre de rol.
 */
export type LabTabSection = "GENERAL" | "LABORATORIO";

export interface LabTab {
  path: string;
  label: string;
  section: LabTabSection;
  icon: "home" | "user" | "users" | "shield" | "flask" | "ticket" | "chart";
  permissions?: string[];
  /** Si se define, el tab solo se muestra cuando el mecanismo activo coincide. */
  mechanisms?: string[];
}

export const LAB_TABS: LabTab[] = [
  { path: "/", label: "Inicio", section: "GENERAL", icon: "home" },
  { path: "/perfil", label: "Perfil", section: "GENERAL", icon: "user" },

  {
    path: "/roles/crear",
    label: "Crear rol",
    section: "GENERAL",
    icon: "shield",
    permissions: ["ADMIN"],
  },
  {
    path: "/roles/permisos",
    label: "Gestionar permisos",
    section: "GENERAL",
    icon: "shield",
    permissions: ["ADMIN"],
  },
  {
    path: "/usuarios/roles",
    label: "Asignar rol",
    section: "GENERAL",
    icon: "users",
    permissions: ["ADMIN"],
  },
  {
    path: "/usuarios",
    label: "Usuarios",
    section: "GENERAL",
    icon: "users",
    permissions: ["ADMIN"],
  },

  {
    path: "/tickets",
    label: "Tickets",
    section: "GENERAL",
    icon: "ticket",
    permissions: ["READ"],
  },
  {
    path: "/tickets/nuevo",
    label: "Crear ticket",
    section: "GENERAL",
    icon: "ticket",
    permissions: ["WRITE"],
  },

  {
    path: "/solicitudes/configurar",
    label: "Configurar solicitud",
    section: "LABORATORIO",
    icon: "flask",
  },
  {
    path: "/experimentos/revocacion",
    label: "Comparar revocación",
    section: "LABORATORIO",
    icon: "chart",
    permissions: ["ADMIN"],
  },
  {
    path: "/api-keys",
    label: "API Keys",
    section: "LABORATORIO",
    icon: "shield",
    permissions: ["ADMIN"],
  },

  {
    path: "/sesion/jwt",
    label: "Sesión JWT",
    section: "LABORATORIO",
    icon: "shield",
    mechanisms: ["JWT"],
  },

  {
    path: "/oauth/emitir",
    label: "Emitir token OAuth",
    section: "LABORATORIO",
    icon: "shield",
    permissions: ["ADMIN"],
  },
  {
    path: "/oauth/solicitud",
    label: "Solicitud OAuth",
    section: "LABORATORIO",
    icon: "flask",
    permissions: ["ADMIN"],
  },
  {
    path: "/oauth/renovar",
    label: "Renovar token OAuth",
    section: "LABORATORIO",
    icon: "shield",
    permissions: ["ADMIN"],
    mechanisms: ["OAUTH2"],
  },
  {
    path: "/oauth/revocar",
    label: "Revocar token OAuth",
    section: "LABORATORIO",
    icon: "shield",
    permissions: ["ADMIN"],
    mechanisms: ["OAUTH2"],
  },
];
