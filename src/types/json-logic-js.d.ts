// @linked docs/motor-criterios.md
// Si cambias los tipos de apply o add_operation, actualiza el doc enlazado.

declare module 'json-logic-js' {
  type JsonLogicRule = Record<string, unknown> | string | number | boolean | null;

  function apply(rule: JsonLogicRule, data?: unknown): unknown;
  function add_operation(name: string, handler: (...args: unknown[]) => unknown): void;
}
