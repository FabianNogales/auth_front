import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import { useRevokeJwt } from "../../features/authentication/hooks/useRevokeJwt.ts";
import { useSessionStore } from "../../features/authentication/hooks/useSessionStore.ts";
import { initialsOf } from "../../shared/utils/initials.ts";
import { LAB_TABS, type LabTab } from "../router/tabs.ts";
import styles from "./WorkspaceLayout.module.css";

function TabIcon({ icon }: { icon: LabTab["icon"] }) {
  const paths: Record<LabTab["icon"], string> = {
    home: "M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9z",
    user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0v1H5v-1z",
    users:
      "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 9a5 5 0 0 1 10 0v1H4v-1zm12-9a3 3 0 1 0-2.2-5.1A5 5 0 0 1 17 7v1h3v1h-3v2h-1zm-1 9v-1a5 5 0 0 1 3-4.6V20h-3z",
    shield:
      "M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3zm-1.2 9.6l4-4 1.4 1.4-5.4 5.4-2.6-2.6 1.4-1.4 1.2 1.2z",
    flask:
      "M10 3h4v2h-1v5.2l4.5 8.1A1 1 0 0 1 16.6 20H7.4a1 1 0 0 1-.9-1.4L11 10.2V5h-1V3zm2 12.4L9.6 18h4.8L12 15.4z",
    ticket:
      "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8l-6-6zm0 2l5 5H6V4h12l5 5zm0 2l-5 5H6V4h12l5 5zm0 2l-5 5H6V4h12l5 5zm0 2l-5 5H6V4h8v2z",
    chart:
      "M3 3v18h18V3H3zm8 14H7v-6h2v6h4v-6h2v6h2v-6h2v6h2V5h2v14zm-8-6h2v4H9v-4zm4 0h2v4H9v-4zm4 0h2v4h-2v-4zm4 0h2v4h-2v-4z",
  };

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[icon]} />
    </svg>
  );
}

/**
 * Layout estándar del workspace: sidebar con tabs + topbar + Outlet.
 * Otros devs agregan tabs en `app/router/tabs.ts`, nada más.
 * En móvil el sidebar es un drawer con hamburguesa.
 */
export function WorkspaceLayout() {
  const location = useLocation();
  const user = useSessionStore((state) => state.user);
  const mechanism = useSessionStore((state) => state.mechanism);
  const sessionRoles = useSessionStore((state) => state.roles);
  const logout = useSessionStore((state) => state.logout);
  const jwtToken = useSessionStore((state) => state.jwtToken);
  const revokeJwt = useRevokeJwt();
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleTabs = LAB_TABS.filter(
    (tab) =>
      tab.roles === undefined ||
      tab.roles.length === 0 ||
      tab.roles.some((role) => sessionRoles.includes(role)),
  );

  const sections = ["GENERAL", "LABORATORIO"] as const;
  const navigationPath = location.pathname
    .replace(/^\/usuarios\/[^/]+\/api-keys$/, "/api-keys")
    .replace(/^\/roles\/[^/]+\/permisos$/, "/roles/permisos")
    .replace(/^\/usuarios\/[^/]+\/roles$/, "/usuarios/roles")

    .replace(/^\/tickets\/\d+$/, "/tickets");
  const current =
    [...LAB_TABS].reverse().find((tab) => navigationPath === tab.path) ??
    LAB_TABS[0];
  /**
   * Si la sesión activa es JWT y hay token, primero revocamos en el backend
   * (HU3). En cualquier otro mecanismo o sin token, mantenemos el logout
   * local anterior. `logout()` limpia estado + caché; `ProtectedRoute`
   * redirige al login.
   */
  const handleLogout = () => {
    if (mechanism === "JWT" && jwtToken !== null) {
      revokeJwt.mutate(jwtToken);
      return;
    }
    logout();
  };
  return (
    <div className={styles.workspace}>
      {menuOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className={styles.scrim}
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={
          menuOpen ? `${styles.sidebar} ${styles.sidebarOpen}` : styles.sidebar
        }
        aria-label="Navegación"
      >
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </span>
          <div>
            <strong>AuthLab</strong>
            <span>Laboratorio de autenticación</span>
          </div>
        </div>

        {sections.map((section) => {
          const tabs = visibleTabs.filter((tab) => tab.section === section);
          if (tabs.length === 0) {
            return null;
          }
          return (
            <nav
              key={section}
              className={styles.navSection}
              aria-label={section}
            >
              <p className={styles.navTitle}>{section}</p>
              {tabs.map((tab) => (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    isActive || navigationPath === tab.path
                      ? `${styles.navLink} ${styles.navLinkActive}`
                      : styles.navLink
                  }
                >
                  <span className={styles.navIcon}>
                    <TabIcon icon={tab.icon} />
                  </span>
                  {tab.label}
                </NavLink>
              ))}
            </nav>
          );
        })}
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topLeft}>
            <button
              type="button"
              className={styles.menuButton}
              aria-label="Abrir menú"
              onClick={() => setMenuOpen(true)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
            <p className={styles.breadcrumb}>
              Workspace &nbsp;›&nbsp; <strong>{current.label}</strong>
            </p>
          </div>
          <div className={styles.topRight}>
            <span className={styles.env}>
              <span className={styles.envDot} aria-hidden="true" />
              Entorno de demostración
            </span>
            <div className={styles.userChip}>
              <span className={styles.avatar} aria-hidden="true">
                {user !== null ? initialsOf(user.name) : "??"}
              </span>
              <span>
                <strong>{user?.name ?? "Sin sesión"}</strong>
                <span>{mechanism ?? "—"}</span>
              </span>
            </div>
            <button
              type="button"
              className={styles.logoutButton}
              onClick={handleLogout}
              disabled={revokeJwt.isPending}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
              <span>Cerrar sesión</span>
            </button>
          </div>
        </header>

        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
