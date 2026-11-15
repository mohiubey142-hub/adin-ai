// src/services/sync/docsync/hash.ts
import { VOLATILE_DATA_KEYS } from './constants';

// Keys sorted + volatile keys (root only) skipped. Postgres jsonb reorders keys, so plain
// JSON.stringify would call identical documents "different".
const stableStringify = (value: any, isRoot: boolean): string => {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map((v) => stableStringify(v, false)).join(',')}]`;
  const keys = Object.keys(value)
    .filter((k) => value[k] !== undefined && !(isRoot && VOLATILE_DATA_KEYS.has(k)))
    .sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k], false)}`).join(',')}}`;
};

// cyrb53 — small, fast, well-known 53-bit string hash (constants are part of the algorithm)
const hashString = (str: string): string => {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
};

export const hashDocContent = (data: any): string => hashString(stableStringify(data ?? {}, true));
