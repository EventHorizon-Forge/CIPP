import axios from "axios";

/**
 * Local `yarn dev` (without SWA) has no `/.auth/me` and no `x-ms-client-principal` headers.
 * This installs axios hooks so `/api/*` calls reach the Functions host (via next rewrites) with SWA-like headers,
 * and `/.auth/me` resolves locally. Only runs when NEXT_PUBLIC_CIPP_DEV_LOCAL_AUTH is true.
 */
const SWA_PRINCIPAL = {
  identityProvider: "aad",
  userId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  userDetails: "local-dev@localhost",
  userRoles: ["superadmin", "authenticated", "admin"],
  claims: [],
  metadata: {},
};

let installed = false;

function normalizePath(url) {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("http")) {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }
  return url.split("?")[0];
}

export function installCippDevLocalAuth() {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "development") return;
  if (process.env.NEXT_PUBLIC_CIPP_DEV_LOCAL_AUTH !== "true") return;
  if (installed) return;
  installed = true;

  axios.interceptors.request.use((config) => {
    const path = normalizePath(config.url);
    if (path === "/.auth/me") {
      const payload = { clientPrincipal: SWA_PRINCIPAL };
      config.adapter = () =>
        Promise.resolve({
          data: payload,
          status: 200,
          statusText: "OK",
          headers: {},
          config,
          request: {},
        });
      return config;
    }
    if (path.startsWith("/api/")) {
      const json = JSON.stringify(SWA_PRINCIPAL);
      const b64 = btoa(json);
      if (!config.headers) {
        config.headers = {};
      }
      if (typeof config.headers.set === "function") {
        config.headers.set("x-ms-client-principal", b64);
        config.headers.set("x-ms-client-principal-name", SWA_PRINCIPAL.userDetails);
        config.headers.set("x-ms-client-principal-id", SWA_PRINCIPAL.userId);
        config.headers.set("x-ms-client-principal-idp", SWA_PRINCIPAL.identityProvider);
      } else {
        config.headers["x-ms-client-principal"] = b64;
        config.headers["x-ms-client-principal-name"] = SWA_PRINCIPAL.userDetails;
        config.headers["x-ms-client-principal-id"] = SWA_PRINCIPAL.userId;
        config.headers["x-ms-client-principal-idp"] = SWA_PRINCIPAL.identityProvider;
      }
    }
    return config;
  });
}
