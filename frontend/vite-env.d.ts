// frontend/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_ENV: string
  // Agrega cualquier otra variable que uses
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
