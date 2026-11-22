export interface Service {
  name: string;
  url: string;
  image: string;
  /** Optional; services without a group are rendered under "Other". */
  group?: string;
  /** Optional short description shown below the name. */
  description?: string;
}

declare global {
  interface Window {
    /** Injected by the container entrypoint (or the dev stub) via config/services.js. */
    __SERVICES__: Service[] | undefined;
  }
}

export const REQUIRED_FIELDS: readonly (keyof Service)[] = ['name', 'url', 'image'];

export function isService(value: unknown): value is Service {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return REQUIRED_FIELDS.every((field) => typeof record[field] === 'string' && (record[field] as string).trim().length > 0);
}
