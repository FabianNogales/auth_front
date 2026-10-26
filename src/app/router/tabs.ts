/**
 * Registro central de tabs del workspace.
 *
 * Otros devs agregan páginas aquí: una entrada = un item del sidebar.
 * `roles` filtra por rol en UI (vacío = solo exige sesión). La autorización
 * real siempre la decide el backend por request.
 */
export type LabTabSection = "GENERAL" | "LABORATORIO";

export interface LabTab {
  path: string;
  label: string;
  section: LabTabSection;
  icon: "home" | "user" | "users" | "shield" | "flask" | "ticket" | "chart";
  roles?: string[];
}

export const LAB_TABS: LabTab[] = [
  { path: "/", label: "Inicio", section: "GENERAL", icon: "home" },
  { path: "/perfil", label: "Perfil", section: "GENERAL", icon: "user" },

  {
    path: "/roles/crear",
    label: "Crear rol",
    section: "GENERAL",
    icon: "shield",
    roles: ["ADMIN"],
  },
  {
    path: "/roles/permisos",
    label: "Gestionar permisos",
    section: "GENERAL",
    icon: "shield",
    roles: ["ADMIN"],
  },
  {
    path: "/usuarios/roles",
    label: "Asignar rol",
    section: "GENERAL",
    icon: "users",
    roles: ["ADMIN"],
  },

  {
    path: "/usuarios",
    label: "Usuarios",
    section: "GENERAL",
    icon: "users",
    roles: ["ADMIN"],
  },

  {
    path: "/tickets",
    label: "Tickets",
    section: "GENERAL",
    icon: "ticket",
    roles: ["VIEWER", "EDITOR", "ADMIN"],
  },
  {
    path: "/tickets/nuevo",
    label: "Crear ticket",
    section: "GENERAL",
    icon: "ticket",
    roles: ["VIEWER", "EDITOR", "ADMIN"],
  },
  {
    path: "/api-keys",
    label: "API Keys",
    section: "LABORATORIO",
    icon: "shield",
    roles: ["ADMIN"],
  },

  {
    path: "/sesion/jwt",
    label: "Sesión JWT",
    section: "LABORATORIO",
    icon: "shield",
    roles: ["VIEWER", "EDITOR", "ADMIN"],
  },

  {
    path: "/oauth/emitir",
    label: "Emitir token OAuth",
    section: "LABORATORIO",
    icon: "shield",
    roles: ["ADMIN"],
  },

  {
    path: "/oauth/emitir",
    label: "Emitir token OAuth",
    section: "LABORATORIO",
    icon: "shield",
    roles: ["ADMIN"],
  },
  {
    path: "/oauth/solicitud",
    label: "Solicitud OAuth",
    section: "LABORATORIO",
    icon: "flask",
    roles: ["ADMIN"],
  },
  {
    path: "/oauth/renovar",
    label: "Renovar token OAuth",
    section: "LABORATORIO",
    icon: "shield",
    roles: ["ADMIN"],
  },
  {
    path: "/oauth/revocar",
    label: "Revocar token OAuth",
    section: "LABORATORIO",
    icon: "shield",
    roles: ["ADMIN"],
  },
];
