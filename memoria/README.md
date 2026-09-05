# Estado de revisión documental del TFG

**Fecha de revisión:** 1 de septiembre de 2026
**Objeto:** memoria del TFG Tipo I
**Criterio:** no atribuir al producto resultados, cobertura o validaciones sin
evidencia reproducible.

## Correcciones de contenido (16 de agosto)

Ya están en el texto de la memoria:

- El alcance se limita a los criterios evaluables con los datos disponibles.
  Se distinguen la captura desde la interfaz, los datos que solo llegan por
  JSON, la confirmación manual y los criterios no evaluables.
- «Validación clínica» se sustituyó por «verificación de conformidad con la
  guía STOPP/START» y se añadieron amenazas a la validez.
- Las afirmaciones no medidas sobre tiempo, usabilidad y utilidad clínica se
  reformularon como objetivos o limitaciones.
- `excludes` se conserva como nombre técnico, pero ya no se describe como una
  contraindicación absoluta.
- Las horas se presentan como estimación retrospectiva con fecha de corte, no
  como un registro real exacto.
- Se añadieron criterios de aceptación para RF y RNF y una matriz
  requisitos--evidencia.
- Se añadió un inventario de cobertura demostrable por sistema que no
  confunde las 218 reglas con los 190 criterios oficiales; la matriz clínica
  individual sigue pendiente.
- Se corrigieron la cardinalidad `PatientCase → Med`, el diagrama
  arquitectónico y la separación entre datos de interfaz, importación y
  revisión manual.
- El análisis de privacidad incorpora manipulación y corrupción de
  `localStorage`, retención, exportaciones, copias y riesgo residual.
- Se añadió un estado del arte con sistemas informatizados comparables y
  resultados publicados.
- Se retiraron los agradecimientos de relleno y los campos administrativos
  vacíos no se imprimen en la portada.
- Se corrigieron términos como `multiclasse`, «familia mutex», `Stopp/start`
  e «Ingenieria Informatica».

## Evidencia obtenida (1 de septiembre de 2026)

| Comprobación | Resultado |
|--------------|-----------|
| `npx ng test --watch=false --browsers=ChromeHeadless` | **TOTAL: 989 SUCCESS** (1,59 s; Chrome Headless 148; Node 22.14.0). Log: `memoria/anexos/karma-2026-09-01.log` |
| `npm audit --omit=dev` | 7 high (Angular 20.3.x XSS advisories). Full `npm audit`: 17. Log: `memoria/anexos/npm-audit-2026-09-01.txt`. No `npm audit fix` applied. |
| `npx ng build --configuration production` | Artefacto en `dist/stopp-start-app/browser` (código 0; advertencias de presupuesto CSS) |
| Servicio estático | `python3 -m http.server 4173 --directory dist/stopp-start-app/browser` → `http://127.0.0.1:4173` |
| Caso manual HTA → START-B1 → Amlodipino | Ejecutado el 01/09/2026; capturas en `memoria/figuras/` y JSON en `memoria/anexos/caso-hta-2026-09-01.json` |
| `node scripts/audit-criteria.cjs` | Correcto: 218 reglas; sin sistemas, clases ni diagnósticos desconocidos |
| `bash scripts/check-links.sh` | Correcto: 0 problemas |
| Inventario estático | 989 cláusulas `it(`, sin `xit` ni `fit` localizados |
| Compilación LaTeX | XeLaTeX + Biber; PDF en `memoria/Memoria_TFG_STOPP_START.pdf` |

La auditoría del catálogo demuestra consistencia referencial interna. No
demuestra por sí sola la correspondencia clínica entre las 218 reglas y los
190 criterios de la guía. La suite Karma acredita que las 989 especificaciones
pasan; no acredita utilidad clínica ni usabilidad.

## Pendientes que requieren evidencia o información externa

- Confirmar el título oficial; verificar también el mes de depósito
  indicado en la portada.
- Elaborar y revisar de forma independiente la correspondencia individual:
  criterio oficial, reglas, datos necesarios, caso positivo, caso negativo y
  estado.
- Comprobar la normativa de presentación, la guía docente, la rúbrica y las
  instrucciones de depósito vigentes.
- Si se quiere afirmar usabilidad o utilidad clínica, realizar una evaluación
  formal con profesionales; la memoria actual no lo afirma.
- Publicar el artefacto de producción en GitHub Pages si se desea una URL
  pública además del servicio estático local ya documentado.

## Comandos de cierre

Desde la raíz del repositorio:

```bash
npm install
npx ng test --watch=false --browsers=ChromeHeadless
npx ng build --configuration production
python3 -m http.server 4173 --bind 127.0.0.1 \
  --directory dist/stopp-start-app/browser
node scripts/audit-criteria.cjs
bash scripts/check-links.sh
```

Desde `memoria/`:

```bash
xelatex main.tex
biber main
xelatex main.tex
xelatex main.tex
```
