import type { AuthenticationMethod } from "../../../shared/types/authentication.ts";
import { AUTHENTICATION_API_VALUES } from "../../../shared/constants/authentication.ts";

export const MECHANISM_OPTIONS = [
  {
    value: "API_KEY",
    backend: AUTHENTICATION_API_VALUES.API_KEY,
    label: "API Key",
  },
  { value: "BASIC", backend: AUTHENTICATION_API_VALUES.BASIC, label: "Basic" },
  { value: "JWT", backend: AUTHENTICATION_API_VALUES.JWT, label: "JWT" },
  {
    value: "OAUTH2",
    backend: AUTHENTICATION_API_VALUES.OAUTH2,
    label: "OAuth 2.0",
  },
] as const;
export type BackendMechanism = (typeof MECHANISM_OPTIONS)[number]["backend"];
export type RequestCredentials =
  | { mechanism: "API_KEY"; apiKey: string }
  | { mechanism: "BASIC"; email: string; password: string }
  | { mechanism: "JWT"; token: string }
  | { mechanism: "OAUTH2"; token: string; discriminator: "oauth" };
export function emptyCredentials(
  mechanism: AuthenticationMethod,
): RequestCredentials {
  switch (mechanism) {
    case "API_KEY":
      return { mechanism, apiKey: "" };
    case "BASIC":
      return { mechanism, email: "", password: "" };
    case "JWT":
      return { mechanism, token: "" };
    case "OAUTH2":
      return { mechanism, token: "", discriminator: "oauth" };
  }
}
export function backendMechanism(
  mechanism: AuthenticationMethod,
): BackendMechanism {
  return MECHANISM_OPTIONS.find((option) => option.value === mechanism)!
    .backend;
}
