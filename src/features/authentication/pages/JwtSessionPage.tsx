import { useState, type FormEvent } from "react";
import { Link } from "react-router";

import { isApiError } from "../../../shared/services/ApiError.ts";
import { useRefreshJwt } from "../hooks/useRefreshJwt.ts";
import { useRevokeJwt } from "../hooks/useRevokeJwt.ts";
import { useSessionStore } from "../hooks/useSessionStore.ts";
import styles from "./JwtSessionPage.module.css";

/** Decodifica `exp` del payload del JWT para mostrar el vencimiento. */
function formatJwtExpiry(token: string): string | null {
  try {
    const [, payload] = token.split(".");
    const decoded = JSON.parse(atob(payload)) as { exp?: unknown };
    if (typeof decoded.exp !== "number") {
      return null;
    }
    return new Date(decoded.exp * 1000).toLocaleString("es-AR");
  } catch {
    return null;
  }
}

/** Enmascara el token para mostrarlo sin exponerlo completo. */
function maskToken(token: string): string {
  if (token.length <= 16) {
    return "•".repeat(token.length);
  }
  return `${token.slice(0, 8)}…${token.slice(-8)}`;
}

/**
 * Página de sesión JWT (HU2 + HU3): permite renovar el token activo
 * (rotación) y revocarlo. Coexiste con el botón "Cerrar sesión" del
 * header, que ahora también revoca cuando el mecanismo es JWT.
 */
export function JwtSessionPage() {
  const jwtToken = useSessionStore((state) => state.jwtToken);
  const [inputToken, setInputToken] = useState(() => jwtToken ?? "");
  const [validationError, setValidationError] = useState<string | null>(null);
  const refresh = useRefreshJwt();
  const revoke = useRevokeJwt();

  const handleRefresh = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);
    if (refresh.isPending) {
      return;
    }
    const trimmed = inputToken.trim();
    if (!trimmed) {
      setValidationError("El token JWT es obligatorio.");
      return;
    }
    refresh.reset();
    refresh.mutate(trimmed);
  };

  const handleRevoke = () => {
    if (revoke.isPending || jwtToken === null) {
      return;
    }
    setValidationError(null);
    revoke.mutate(jwtToken);
  };

  const refreshErrorMessage = refresh.isError
    ? isApiError(refresh.error) && refresh.error.isUnauthorized
      ? "Tu sesión ha expirado, por favor inicia sesión nuevamente."
      : "No se pudo renovar el token."
    : null;

  const currentExpiry = jwtToken !== null ? formatJwtExpiry(jwtToken) : null;

  return (
    <main className={styles.page}>
      <header>
        <p className={styles.eyebrow}>LABORATORIO JWT</p>
        <h1>Sesión JWT</h1>
        <p>
          Renueva o cierra tu token JWT activo sin volver a ingresar
          credenciales.
        </p>
      </header>

      <section className={styles.panel} aria-label="Sesión actual">
        <h2>Token actual</h2>
        {jwtToken !== null ? (
          <>
            <code className={styles.tokenBlock}>{maskToken(jwtToken)}</code>
            {currentExpiry !== null && (
              <p className={styles.hint}>Expira: {currentExpiry}</p>
            )}
          </>
        ) : (
          <p className={styles.hint}>
            No hay una sesión JWT activa.{" "}
            <Link to="/login/jwt">Inicia sesión</Link> para continuar.
          </p>
        )}
      </section>

      <section className={styles.panel} aria-label="Renovar sesión">
        <h2>Renovar sesión</h2>
        <form className={styles.form} onSubmit={handleRefresh} noValidate>
          <div>
            <label htmlFor="jwt-refresh-token">Token JWT</label>
            <input
              id="jwt-refresh-token"
              type="password"
              autoComplete="off"
              value={inputToken}
              onChange={(event) => setInputToken(event.target.value)}
              disabled={refresh.isPending}
            />
          </div>
          <p className={styles.hint}>
            Cada renovación invalida el token anterior. Reutilizar un token ya
            rotado cierra tu sesión.
          </p>
          <button type="submit" disabled={refresh.isPending}>
            {refresh.isPending ? "Renovando…" : "Renovar sesión"}
          </button>
        </form>

        {validationError !== null && (
          <p role="alert" className={styles.error}>
            {validationError}
          </p>
        )}
        {refreshErrorMessage !== null && (
          <p role="alert" className={styles.error}>
            {refreshErrorMessage}
          </p>
        )}
        {refresh.isSuccess && refresh.data !== undefined && (
          <div className={styles.result} role="status" aria-live="polite">
            <p>
              Token renovado correctamente. El token anterior ya no es válido.
            </p>
            <code className={styles.tokenBlock}>{refresh.data.token}</code>
            {formatJwtExpiry(refresh.data.token) !== null && (
              <p className={styles.hint}>
                Nuevo vencimiento: {formatJwtExpiry(refresh.data.token)}
              </p>
            )}
          </div>
        )}
      </section>

      <section className={styles.panel} aria-label="Cerrar sesión">
        <h2>Cerrar sesión</h2>
        <p className={styles.hint}>
          Marca el token actual como revocado. A partir de ese momento,
          cualquier solicitud con este token será rechazada y volverás al
          formulario de inicio de sesión.
        </p>
        <button
          type="button"
          onClick={handleRevoke}
          disabled={revoke.isPending || jwtToken === null}
        >
          {revoke.isPending ? "Cerrando…" : "Cerrar sesión"}
        </button>
      </section>
    </main>
  );
}
