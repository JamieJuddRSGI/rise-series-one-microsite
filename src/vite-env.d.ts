/// <reference types="vite/client" />

interface ImportMeta {
  glob: (pattern: string, options?: { as?: 'raw' | 'url'; eager?: boolean }) => Record<string, string | (() => Promise<any>)>;
}
