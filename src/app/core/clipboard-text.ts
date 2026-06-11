// @linked docs/informes-y-exportacion.md
// Si cambias el formato de salida de texto plano, actualiza el doc enlazado.
import { Crit } from './types';
import { groupBySystem, critCode } from './criteria-groups';

export function buildCriteriaText(criteria: Crit[]): string {
  if (criteria.length === 0) return 'Sin criterios aplicables.';

  const lines: string[] = [];
  for (const group of groupBySystem(criteria)) {
    lines.push(group.system.toUpperCase());
    for (const c of group.items) {
      lines.push(`  ${c.type} ${critCode(c.id)} — ${c.summary}`);
    }
    lines.push('');
  }
  return lines.join('\n').trimEnd();
}
