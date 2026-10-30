import { useId } from "react";
import {
  emptyCredentials,
  MECHANISM_OPTIONS,
  type RequestCredentials,
} from "../types/requestConfiguration.ts";
interface Props {
  value: RequestCredentials;
  onChange: (value: RequestCredentials) => void;
  disabled?: boolean;
}
export function AuthenticationSelector({
  value,
  onChange,
  disabled = false,
}: Props) {
  const id = useId();
  return (
    <fieldset disabled={disabled}>
      <legend>Mecanismo de autenticación</legend>
      <div role="group" aria-label="Opciones de autenticación">
        {MECHANISM_OPTIONS.map((option) => (
          <label key={option.value}>
            <input
              type="radio"
              name={`${id}-mechanism`}
              value={option.value}
              checked={value.mechanism === option.value}
              onChange={() => onChange(emptyCredentials(option.value))}
            />{" "}
            {option.label}
          </label>
        ))}
      </div>
      {value.mechanism === "API_KEY" && (
        <label>
          API Key
          <input
            type="password"
            autoComplete="off"
            value={value.apiKey}
            onChange={(event) =>
              onChange({ ...value, apiKey: event.target.value })
            }
          />
        </label>
      )}
      {value.mechanism === "BASIC" && (
        <>
          <label>
            Correo electrónico
            <input
              type="email"
              autoComplete="off"
              value={value.email}
              onChange={(event) =>
                onChange({ ...value, email: event.target.value })
              }
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              autoComplete="off"
              value={value.password}
              onChange={(event) =>
                onChange({ ...value, password: event.target.value })
              }
            />
          </label>
        </>
      )}
      {(value.mechanism === "JWT" || value.mechanism === "OAUTH2") && (
        <label>
          {value.mechanism === "JWT" ? "Token JWT" : "Token OAuth"}
          <input
            type="password"
            autoComplete="off"
            value={value.token}
            onChange={(event) =>
              onChange({ ...value, token: event.target.value })
            }
          />
        </label>
      )}
      {value.mechanism === "OAUTH2" && (
        <label>
          Mecanismo adicional
          <select value={value.discriminator} disabled>
            <option value="oauth">oauth</option>
          </select>
        </label>
      )}
    </fieldset>
  );
}
