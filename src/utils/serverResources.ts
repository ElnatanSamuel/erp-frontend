import { createServerResourceFactory } from '@elnatan/better-state/adapters/next';

export const serverResource = createServerResourceFactory({ ttlMs: 5_000 });
