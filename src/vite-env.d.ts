/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Google Analytics 4 Measurement ID (G-XXXXXXXXXX). 빌드 시 주입, 공개값. */
  readonly VITE_GA_ID?: string
  readonly [key: string]: string | boolean | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
