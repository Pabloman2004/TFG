// @linked docs/flujo-pasos.md
// Si cambias groupBySystem o critCode, actualiza el doc enlazado.
import { Crit } from './types';

export type CritGroup = { system: string; items: Crit[] };

export function groupBySystem(criteria: Crit[]): CritGroup[] {
  const map = new Map<string, Crit[]>();
  for (const c of criteria) {
    const bucket = map.get(c.system);
    if (bucket) {
      bucket.push(c);
    } else {
      map.set(c.system, [c]);
    }
  }
  return [...map.entries()].map(([system, items]) => ({ system, items }));
}

export function critCode(id: string): string {
  return id.split('-')[1] ?? '';
}
