[33mcommit e8e1862210c3d663ec2f6ee8d8e833b789e8a35f[m
Author: poko233 <victorterrazasc05@gmail.com>
Date:   Wed Oct 14 16:48:32 2026 -0400

    bases...

[1mdiff --git a/package-lock.json b/package-lock.json[m
[1mindex 96cbc95..89fc227 100644[m
[1m--- a/package-lock.json[m
[1m+++ b/package-lock.json[m
[36m@@ -16,7 +16,9 @@[m
         "react-hook-form": "^7.89.0",[m
         "react-router": "^7.18.4",[m
         "recharts": "^3.10.1",[m
[31m-        "zod": "^4.6.5"[m
[32m+[m[32m        "sonner": "^2.0.8",[m
[32m+[m[32m        "zod": "^4.6.5",[m
[32m+[m[32m        "zustand": "^5.0.15"[m
       },[m
       "devDependencies": {[m
         "@eslint/js": "^10.0.1",[m
[36m@@ -1929,24 +1931,6 @@[m
         "node": ">= 6.0.0"[m
       }[m
     },[m
[31m-    "node_modules/ajv": {[m
[31m-      "version": "8.20.0",[m
[31m-      "resolved": "https://registry.npmjs.org/ajv/-/ajv-8.20.0.tgz",[m
[31m-      "integrity": "sha512-Thbli+OlOj+iMPYFBVBfJ3OmCAnaSyNn4M1vz9T6Gka5Jt9ba/HIR56joy65tY6kx/FCF5VXNB819Y7/GUrBGA==",[m
[31m-      "license": "MIT",[m
[31m-      "optional": true,[m
[31m-      "peer": true,[m
[31m-      "dependencies": {[m
[31m-        "fast-deep-equal": "^3.1.3",[m
[31m-        "fast-uri": "^3.0.1",[m
[31m-        "json-schema-traverse": "^1.0.0",[m
[31m-        "require-from-string": "^2.0.2"[m
[31m-      },[m
[31m-      "funding": {[m
[31m-        "type": "github",[m
[31m-        "url": "https://github.com/sponsors/epoberezkin"[m
[31m-      }[m
[31m-    },[m
     "node_modules/ansi-regex": {[m
       "version": "5.0.1",[m
       "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",[m
[36m@@ -2801,7 +2785,7 @@[m
       "version": "3.1.3",[m
       "resolved": "https://registry.npmjs.org/fast-deep-equal/-/fast-deep-equal-3.1.3.tgz",[m
       "integrity": "sha512-f3qQ9oQy9j2AhBe/H9VC91wLmKBCCU/gDOnKNAYG5hswO7BLKj09Hc5HYNz9cGI++xlpDCIgDaitVs03ATR84Q==",[m
[31m-      "devOptional": true,[m
[32m+[m[32m      "dev": true,[m
       "license": "MIT"[m
     },[m
     "node_modules/fast-json-stable-stringify": {[m
[36m@@ -2818,24 +2802,6 @@[m
       "dev": true,[m
       "license": "MIT"[m
     },[m
[31m-    "node_modules/fast-uri": {[m
[31m-      "version": "3.1.8",[m
[31m-      "resolved": "https://registry.npmjs.org/fast-uri/-/fast-uri-3.1.8.tgz",[m
[31m-      "integrity": "sha512-GZMtZUTNRpOVIECoXwLNZS5xUGE+mVNbTB8h/7Rwh2TFWcBQiPzTgyZi05BF9UMZKkLJv8XBRJTlU7zg8+ZfMg==",[m
[31m-      "funding": [[m
[31m-        {[m
[31m-          "type": "github",[m
[31m-          "url": "https://github.com/sponsors/fastify"[m
[31m-        },[m
[31m-        {[m
[31m-          "type": "opencollective",[m
[31m-          "url": "https://opencollective.com/fastify"[m
[31m-        }[m
[31m-      ],[m
[31m-      "license": "BSD-3-Clause",[m
[31m-      "optional": true,[m
[31m-      "peer": true[m
[31m-    },[m
     "node_modules/fdir": {[m
       "version": "6.5.0",[m
       "resolved": "https://registry.npmjs.org/fdir/-/fdir-6.5.0.tgz",[m
[36m@@ -3304,14 +3270,6 @@[m
         "node": ">=6"[m
       }[m
     },[m
[31m-    "node_modules/json-schema-traverse": {[m
[31m-      "version": "1.0.0",[m
[31m-      "resolved": "https://registry.npmjs.org/json-schema-traverse/-/json-schema-traverse-1.0.0.tgz",[m
[31m-      "integrity": "sha512-NM8/P9n3XjXhIZn1lLhkFaACTOURQXjWhV4BA/RnOv8xvgqtqpAX9IO4mRQxSx1Rlo4tqzeqb0sOlruaOy3dug==",[m
[31m-      "license": "MIT",[m
[31m-      "optional": true,[m
[31m-      "peer": true[m
[31m-    },[m
     "node_modules/json-stable-stringify-without-jsonify": {[m
       "version": "1.0.1",[m
       "resolved": "https://registry.npmjs.org/json-stable-stringify-without-jsonify/-/json-stable-stringify-without-jsonify-1.0.1.tgz",[m
[36m@@ -4182,7 +4140,7 @@[m
       "version": "2.0.2",[m
       "resolved": "https://registry.npmjs.org/require-from-string/-/require-from-string-2.0.2.tgz",[m
       "integrity": "sha512-Xf0nWe6RseziFMu+Ap9biiUbmplq6S9/p+7w7YXP/JBHhrUDDUhwa+vANyubuqfZWTveU//DYVGsDG7RKL/vEw==",[m
[31m-      "devOptional": true,[m
[32m+[m[32m      "dev": true,[m
       "license": "MIT",[m
       "engines": {[m
         "node": ">=0.10.0"[m
[36m@@ -4293,6 +4251,22 @@[m
       "dev": true,[m
       "license": "ISC"[m
     },[m
[32m+[m[32m    "node_modules/sonner": {[m
[32m+[m[32m      "version": "2.0.8",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/sonner/-/sonner-2.0.8.tgz",[m
[32m+[m[32m      "integrity": "sha512-UM/ByIoFra8yzV75n1o0Puu0bw5U/9UNnDacrJNspekBewIfsQ3D6ez1nvlWpt7aTsO6rujQtifBpycwIivqlg==",[m
[32m+[m[32m      "license": "MIT",[m
[32m+[m[32m      "peerDependencies": {[m
[32m+[m[32m        "@types/react": "^18.0.0 || ^19.0.0",[m
[32m+[m[32m        "react": "^18.0.0 || ^19.0.0 || ^19.0.0-rc",[m
[32m+[m[32m        "react-dom": "^18.0.0 || ^19.0.0 || ^19.0.0-rc"[m
[32m+[m[32m      },[m
[32m+[m[32m      "peerDependenciesMeta": {[m
[32m+[m[32m        "@types/react": {[m
[32m+[m[32m          "optional": true[m
[32m+[m[32m        }[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
     "node_modules/source-map-js": {[m
       "version": "1.2.1",[m
       "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",[m
[36m@@ -4903,6 +4877,35 @@[m
       "peerDependencies": {[m
         "zod": "^3.25.0 || ^4.0.0"[m
       }[m
[32m+[m[32m    },[m
[32m+[m[32m    "node_modules/zustand": {[m
[32m+[m[32m      "version": "5.0.15",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/zustand/-/zustand-5.0.15.tgz",[m
[32m+[m[32m      "integrity": "sha512-MpSEjRiBkA9crSYeOUH32rJC7SVqAbm0Fqcqge/bUi2PPoLcBWKOsG+C8mevmpr8TwXHBVkChbbJiyvkE+i/3A==",[m
[32m+[m[32m      "license": "MIT",[m
[32m+[m[32m      "engines": {[m
[32m+[m[32m        "node": ">=12.20.0"[m
[32m+[m[32m      },[m
[32m+[m[32m      "peerDependencies": {[m
[32m+[m[32m        "@types/react": ">=18.0.0",[m
[32m+[m[32m        "immer": ">=9.0.6",[m
[32m+[m[32m        "react": ">=18.0.0",[m
[32m+[m[32m        "use-sync-external-store": ">=1.2.0"[m
[32m+[m[32m      },[m
[32m+[m[32m      "peerDependenciesMeta": {[m
[32m+[m[32m        "@types/react": {[m
[32m+[m[32m          "optional": true[m
[32m+[m[32m        },[m
[32m+[m[32m        "immer": {[m
[32m+[m[32m          "optional": true[m
[32m+[m[32m        },[m
[32m+[m[32m        "react": {[m
[32m+[m[32m          "optional": true[m
[32m+[m[32m        },[m
[32m+[m[32m        "use-sync-external-store": {[m
[32m+[m[32m          "optional": true[m
[32m+[m[32m        }[m
[32m+[m[32m      }[m
     }[m
   }[m
 }[m
[1mdiff --git a/package.json b/package.json[m
[1mindex fa3eeed..9a02a69 100644[m
[1m--- a/package.json[m
[1m+++ b/package.json[m
[36m@@ -21,7 +21,9 @@[m
     "react-hook-form": "^7.89.0",[m
     "react-router": "^7.18.4",[m
     "recharts": "^3.10.1",[m
[31m-    "zod": "^4.6.5"[m
[32m+[m[32m    "sonner": "^2.0.8",[m
[32m+[m[32m    "zod": "^4.6.5",[m
[32m+[m[32m    "zustand": "^5.0.15"[m
   },[m
   "devDependencies": {[m
     "@eslint/js": "^10.0.1",[m
[1mdiff --git a/src/app/App.test.tsx b/src/app/App.test.tsx[m
[1mindex cdb6c59..a934cc8 100644[m
[1m--- a/src/app/App.test.tsx[m
[1m+++ b/src/app/App.test.tsx[m
[36m@@ -4,11 +4,11 @@[m [mimport { describe, expect, it } from 'vitest'[m
 import { App } from './App.tsx'[m
 [m
 describe('App', () => {[m
[31m-  it('renders the initial laboratory page', async () => {[m
[32m+[m[32m  it('redirige al login sin sesión', async () => {[m
     render(<App />)[m
 [m
     expect([m
[31m-      await screen.findByRole('heading', { name: /autenticación lab/i }),[m
[32m+[m[32m      await screen.findByRole('heading', { name: /bienvenido al laboratorio/i }),[m
     ).toBeInTheDocument()[m
   })[m
 })[m
[1mdiff --git a/src/app/App.tsx b/src/app/App.tsx[m
[1mindex e1f5fd5..9b79d65 100644[m
[1m--- a/src/app/App.tsx[m
[1m+++ b/src/app/App.tsx[m
[36m@@ -1,3 +1,5 @@[m
[32m+[m[32mimport { Toaster } from 'sonner'[m
[32m+[m
 import { AppProviders } from './providers/AppProviders.tsx'[m
 import { AppRouter } from './router/AppRouter.tsx'[m
 [m
[36m@@ -5,6 +7,7 @@[m [mexport function App() {[m
   return ([m
     <AppProviders>[m
       <AppRouter />[m
[32m+[m[32m      <Toaster position="top-right" richColors />[m
     </AppProviders>[m
   )[m
 }[m
[1mdiff --git a/src/app/layouts/WorkspaceLayout.module.css b/src/app/layouts/WorkspaceLayout.module.css[m
[1mnew file mode 100644[m
[1mindex 0000000..a7ea068[m
[1m--- /dev/null[m
[1m+++ b/src/app/layouts/WorkspaceLayout.module.css[m
[36m@@ -0,0 +1,285 @@[m
[32m+[m[32m.workspace {[m
[32m+[m[32m  min-height: 100svh;[m
[32m+[m[32m  display: grid;[m
[32m+[m[32m  grid-template-columns: 16rem 1fr;[m
[32m+[m[32m  background: #f6f8fc;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.sidebar {[m
[32m+[m[32m  background: #ffffff;[m
[32m+[m[32m  border-right: 1px solid #e8edf5;[m
[32m+[m[32m  padding: 1.5rem 1rem;[m
[32m+[m[32m  display: flex;[m
[32m+[m[32m  flex-direction: column;[m
[32m+[m[32m  gap: 2rem;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.brand {[m
[32m+[m[32m  display: flex;[m
[32m+[m[32m  align-items: center;[m
[32m+[m[32m  gap: 0.75rem;[m
[32m+[m[32m  padding: 0 0.5rem;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.logo {[m
[32m+[m[32m  width: 2.5rem;[m
[32m+[m[32m  height: 2.5rem;[m
[32m+[m[32m  border-radius: 0.75rem;[m
[32m+[m[32m  background: #2563eb;[m
[32m+[m[32m  color: #ffffff;[m
[32m+[m[32m  position: relative;[m
[32m+[m[32m  flex: none;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.logo svg {[m
[32m+[m[32m  display: block;[m
[32m+[m[32m  position: absolute;[m
[32m+[m[32m  top: 50%;[m
[32m+[m[32m  left: 50%;[m
[32m+[m[32m  transform: translate(-50%, -50%);[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.brand strong {[m
[32m+[m[32m  display: block;[m
[32m+[m[32m  color: #16283f;[m
[32m+[m[32m  font-size: 1.25rem;[m
[32m+[m[32m  font-weight: 800;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.brand span {[m
[32m+[m[32m  display: block;[m
[32m+[m[32m  color: #8a94a6;[m
[32m+[m[32m  font-size: 0.75rem;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.navSection {[m
[32m+[m[32m  display: grid;[m
[32m+[m[32m  gap: 0.25rem;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.navTitle {[m
[32m+[m[32m  margin: 0 0 0.5rem 0.75rem;[m
[32m+[m[32m  color: #9aa5b8;[m
[32m+[m[32m  font-size: 0.7rem;[m
[32m+[m[32m  font-weight: 700;[m
[32m+[m[32m  letter-spacing: 0.1em;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.navLink {[m
[32m+[m[32m  display: flex;[m
[32m+[m[32m  align-items: center;[m
[32m+[m[32m  gap: 0.75rem;[m
[32m+[m[32m  padding: 0.65rem 0.75rem;[m
[32m+[m[32m  border-radius: 0.6rem;[m
[32m+[m[32m  color: #3d4a5c;[m
[32m+[m[32m  font-size: 0.95rem;[m
[32m+[m[32m  font-weight: 600;[m
[32m+[m[32m  text-decoration: none;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.navLink:hover {[m
[32m+[m[32m  background: #f2f6ff;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.navLinkActive {[m
[32m+[m[32m  background: #eaf1ff;[m
[32m+[m[32m  color: #2563eb;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.navIcon {[m
[32m+[m[32m  display: inline-flex;[m
[32m+[m[32m  flex: none;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.main {[m
[32m+[m[32m  display: flex;[m
[32m+[m[32m  flex-direction: column;[m
[32m+[m[32m  min-width: 0;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.topbar {[m
[32m+[m[32m  background: #ffffff;[m
[32m+[m[32m  border-bottom: 1px solid #e8edf5;[m
[32m+[m[32m  padding: 0.9rem 2rem;[m
[32m+[m[32m  display: flex;[m
[32m+[m[32m  align-items: center;[m
[32m+[m[32m  justify-content: space-between;[m
[32m+[m[32m  gap: 1rem;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.topLeft {[m
[32m+[m[32m  display: flex;[m
[32m+[m[32m  align-items: center;[m
[32m+[m[32m  gap: 0.75rem;[m
[32m+[m[32m  min-width: 0;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.menuButton {[m
[32m+[m[32m  display: none;[m
[32m+[m[32m  background: none;[m
[32m+[m[32m  border: 1px solid #e8edf5;[m
[32m+[m[32m  border-radius: 0.5rem;[m
[32m+[m[32m  padding: 0.4rem 0.55rem;[m
[32m+[m[32m  cursor: pointer;[m
[32m+[m[32m  color: #3d4a5c;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.breadcrumb {[m
[32m+[m[32m  margin: 0;[m
[32m+[m[32m  color: #8a94a6;[m
[32m+[m[32m  font-size: 0.9rem;[m
[32m+[m[32m  white-space: nowrap;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.breadcrumb strong {[m
[32m+[m[32m  color: #3d4a5c;[m
[32m+[m[32m  font-weight: 700;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.topRight {[m
[32m+[m[32m  display: flex;[m
[32m+[m[32m  align-items: center;[m
[32m+[m[32m  gap: 1rem;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.env {[m
[32m+[m[32m  display: flex;[m
[32m+[m[32m  align-items: center;[m
[32m+[m[32m  gap: 0.5rem;[m
[32m+[m[32m  color: #3d4a5c;[m
[32m+[m[32m  font-size: 0.85rem;[m
[32m+[m[32m  border-right: 1px solid #e8edf5;[m
[32m+[m[32m  padding-right: 1rem;[m
[32m+[m[32m  white-space: nowrap;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.envDot {[m
[32m+[m[32m  width: 0.5rem;[m
[32m+[m[32m  height: 0.5rem;[m
[32m+[m[32m  border-radius: 9999px;[m
[32m+[m[32m  background: #10b981;[m
[32m+[m[32m  flex: none;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.userChip {[m
[32m+[m[32m  display: flex;[m
[32m+[m[32m  align-items: center;[m
[32m+[m[32m  gap: 0.6rem;[m
[32m+[m[32m  min-width: 0;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.avatar {[m
[32m+[m[32m  width: 2.25rem;[m
[32m+[m[32m  height: 2.25rem;[m
[32m+[m[32m  border-radius: 9999px;[m
[32m+[m[32m  background: #ede9fe;[m
[32m+[m[32m  color: #6d28d9;[m
[32m+[m[32m  display: block;[m
[32m+[m[32m  font-size: 0.8rem;[m
[32m+[m[32m  font-weight: 800;[m
[32m+[m[32m  line-height: 2.25rem;[m
[32m+[m[32m  text-align: center;[m
[32m+[m[32m  flex: none;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.userChip strong {[m
[32m+[m[32m  display: block;[m
[32m+[m[32m  color: #16283f;[m
[32m+[m[32m  font-size: 0.85rem;[m
[32m+[m[32m  white-space: nowrap;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.userChip span {[m
[32m+[m[32m  display: block;[m
[32m+[m[32m  color: #8a94a6;[m
[32m+[m[32m  font-size: 0.75rem;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.logoutButton {[m
[32m+[m[32m  display: flex;[m
[32m+[m[32m  align-items: center;[m
[32m+[m[32m  gap: 0.5rem;[m
[32m+[m[32m  background: none;[m
[32m+[m[32m  border: 1px solid #e8edf5;[m
[32m+[m[32m  border-radius: 0.6rem;[m
[32m+[m[32m  padding: 0.5rem 0.75rem;[m
[32m+[m[32m  color: #3d4a5c;[m
[32m+[m[32m  font-size: 0.85rem;[m
[32m+[m[32m  font-weight: 700;[m
[32m+[m[32m  cursor: pointer;[m
[32m+[m[32m  white-space: nowrap;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.logoutButton:hover {[m
[32m+[m[32m  background: #fef2f2;[m
[32m+[m[32m  border-color: #fecaca;[m
[32m+[m[32m  color: #b91c1c;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.content {[m
[32m+[m[32m  padding: 2rem;[m
[32m+[m[32m  width: 100%;[m
[32m+[m[32m  max-width: 72rem;[m
[32m+[m[32m  margin: 0 auto;[m
[32m+[m[32m  box-sizing: border-box;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m.scrim {[m
[32m+[m[32m  display: none;[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m@media (max-width: 48rem) {[m
[32m+[m[32m  .workspace {[m
[32m+[m[32m    grid-template-columns: 1fr;[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  .sidebar {[m
[32m+[m[32m    position: fixed;[m
[32m+[m[32m    inset: 0 auto 0 0;[m
[32m+[m[32m    width: min(80vw, 18rem);[m
[32m+[m[32m    z-index: 40;[m
[32m+[m[32m    transform: translateX(-105%);[m
[32m+[m[32m    transition: transform 0.2s