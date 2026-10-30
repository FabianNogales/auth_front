import type { AuthenticationMethod } from "../../../shared/types/authentication.ts";

export const MECHANISM_OPTIONS = [
  { value: "API_KEY", backend: "api_key", label: "API Key" },
  { value: "BASIC", backend: "basic", label: "Basic" },
  { value: "JWT", backend: "jwt", label: "JWT" },
  { value: "OAUTH2", backend: "oauth", label: "OAuth 2.0" },
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
