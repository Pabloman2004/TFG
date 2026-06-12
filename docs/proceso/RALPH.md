# RALPH — cómo lanzar el loop

## 0. Preparación

1. Copia `TASKS.md` a la raíz del repo (TFG/).
2. Crea un `scratchpad.md` vacío en la raíz (o deja que el agente lo cree).
3. Asegúrate de partir de working tree limpio (`git status`) y, mejor, en una
   rama: `git checkout -b ralph/review-fixes`
4. Comprueba que `npm test` está en verde ANTES de empezar — el loop usa los
   tests como red de seguridad; si ya hay rojos, el agente no sabrá cuáles
   son suyos.

## 1. Opción A — el loop clásico (bash / Git Bash en Windows)

```bash
while grep -q "\[ \]" TASKS.md; do
  claude -p --model claude-sonnet-4-6 "Lee TASKS.md y scratchpad.md. \
Coge la PRIMERA tarea [ ], márcala [/]. Recuerda las reglas de cabecera de \
TASKS.md: lee los @linked antes de editar, actualiza docs afectados, \
ejecuta el VERIFICAR de la tarea + npm test + ./scripts/check-links.sh. \
Si todo verde: marca [x] y commit 'fix(tasks): T<n> <resumen>'. \
Si no puedes completarla: revierte tus cambios, marca [E] y anota el motivo \
en scratchpad.md. Trabaja UNA sola tarea y termina."
done
```

Notas:
- En Windows, ejecútalo desde Git Bash o WSL (cmd/PowerShell no tienen esta
  sintaxis). Alternativa PowerShell:
  ```powershell
  while (Select-String -Path TASKS.md -Pattern '\[ \]' -Quiet) {
    claude -p --model claude-sonnet-4-6 "...mismo prompt..."
  }
  ```
- El loop para solo cuando no quedan [ ] — las [E] no lo bloquean (por eso
  el agente debe marcar [E] y seguir, no quedarse atascado).
- Sonnet basta para estas tareas (son acotadas y con verificación clara);
  no hace falta quemar Fable aquí.

## 2. Opción B — dentro de una sesión interactiva (más simple)

Si prefieres verlo trabajar y poder intervenir, abre una sesión normal
(`claude --model claude-sonnet-4-6`) y pega:

```
Trabaja TASKS.md de arriba a abajo, UNA tarea por vez, siguiendo las reglas
de su cabecera. Después de cada tarea (verificada y commiteada, o marcada
[E] con motivo), continúa con la siguiente sin preguntarme. Para cuando no
queden [ ] o cuando lleves 3 [E] seguidas, y dame entonces un resumen.
```

Misma mecánica, sin shell. Desventaja: si la sesión se compacta a mitad,
depende del scratchpad y de TASKS.md para reorientarse (por eso las reglas
obligan a apuntarlo todo ahí — no te las saltes).

## 3. Mientras corre / al terminar

- Sigue el progreso con `git log --oneline` y mirando TASKS.md.
- Las tareas [E] son tu cola de revisión manual: el motivo está en
  scratchpad.md.
- Al terminar: revisa los commits uno a uno (son atómicos por tarea),
  y decide sobre la sección "FUERA DEL LOOP" de TASKS.md — esos ítems
  requieren decisión tuya antes de automatizar nada.

## 4. Seguridad

- T1–T3 incluyen "escribe el test antes del fix": no dejes que se lo salte;
  es lo que convierte "parece arreglado" en "está arreglado".
- T7 borra ficheros: el commit atómico permite revertirlo limpio si algo
  sale mal (`git revert <sha>`).
- Si el loop hace algo raro de forma repetida, párate y revisa el prompt o
  trocea la tarea problemática en TASKS.md — es más barato que insistir.
