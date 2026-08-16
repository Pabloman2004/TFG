# Estado de revisión documental del TFG

**Fecha de revisión:** 16 de agosto de 2026
**Objeto:** memoria del TFG Tipo I
**Criterio:** no atribuir al producto resultados, cobertura o validaciones sin
evidencia reproducible.

## Correcciones incorporadas

- El alcance se limita a los criterios evaluables con los datos disponibles.
  Se distinguen la captura desde la interfaz, los datos que solo llegan por
  JSON, la confirmación manual y los criterios no evaluables.
- Las 985 cláusulas `it(` se presentan como inventario estático, no como una
  suite superada. La tabla de pruebas indica que falta una ejecución final.
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
- Las licencias se respaldan con referencias específicas de las versiones
  empleadas.
- El manual incluye un caso ficticio reproducible, salidas esperadas y
  resolución de incidencias, sin inventar un despliegue ni capturas.
- Se retiraron los agradecimientos de relleno y los campos administrativos
  vacíos no se imprimen en la portada.
- Se corrigieron términos como `multiclasse`, «familia mutex», `Stopp/start`
  e «Ingenieria Informatica».

## Evidencia obtenida

| Comprobación | Resultado |
|--------------|-----------|
| `node scripts/audit-criteria.cjs` | Correcto: 218 reglas; sin sistemas, clases ni diagnósticos desconocidos |
| `bash scripts/check-links.sh` | Correcto: 0 problemas |
| Inventario estático | 985 cláusulas `it(`, sin `xit` ni `fit` localizados |
| Suite Karma/Jasmine | No ejecutada en este entorno: `npm`/`npx` no disponibles |
| Compilación LaTeX | No ejecutada en este entorno: XeLaTeX y Biber no disponibles |

La auditoría del catálogo demuestra consistencia referencial interna. No
demuestra por sí sola la correspondencia clínica entre las 218 reglas y los
190 criterios de la guía.

## Pendientes que requieren evidencia o información externa

- Confirmar el título oficial, el número del TFG y el nombre completo de la
  cotutora; verificar también el mes de depósito indicado en la portada.
- Ejecutar la suite final y sustituir «resultado no disponible» por fecha,
  entorno, total ejecutado, omitidas, fallos y veredicto real.
- Compilar con XeLaTeX, Biber y dos pasadas adicionales de XeLaTeX; revisar
  referencias, paginación y desbordamientos del registro resultante.
- Elaborar y revisar de forma independiente la correspondencia individual:
  criterio oficial, reglas, datos necesarios, caso positivo, caso negativo y
  estado.
- Incorporar capturas reales y ejemplos generados de PDF y JSON si se desean
  como evidencia visual de la entrega.
- Comprobar la normativa de presentación, la guía docente, la rúbrica y las
  instrucciones de depósito vigentes.
- Si se quiere afirmar usabilidad o utilidad clínica, realizar una evaluación
  formal con profesionales; la memoria actual no lo afirma.

## Comandos de cierre

Desde la raíz del repositorio:

```bash
npm install
npx ng test --watch=false --browsers=ChromeHeadless
npx ng build --configuration development
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
