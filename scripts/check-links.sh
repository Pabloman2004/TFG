#!/usr/bin/env bash
# scripts/check-links.sh
# Verifica la consistencia del patrón Linked Chunks.
# Ejecutar desde la raíz del repo: ./scripts/check-links.sh
#
# Tipos de problema emitidos:
#   LINK_ROTO    - @linked apunta a una ruta (o anchor) que no existe
#   DOC_HUERFANO - doc bajo docs/ sin ningún @linked que lo referencie
#   SIN_DOC      - fichero listado en _map.md sin @linked en el código
#   FUERA_DE_MAPA - @linked o doc que no aparece en _map.md

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MAP="$REPO_ROOT/docs/_map.md"

problems=0

emit() {
  echo "$1"
  problems=$((problems + 1))
}

# ---------------------------------------------------------------------------
# 1. Parsear docs/_map.md para obtener:
#    - doc_files[doc] = "file1 file2 ..."
#    - file_to_doc[file] = doc
#    - excluded_files[file] = 1
# ---------------------------------------------------------------------------

declare -A doc_files
declare -A file_to_doc
declare -A excluded_files

current_doc=""
in_linking_section=0
in_excluded_section=0

while IFS= read -r line; do

  # Sección "## Doc: docs/foo.md"
  if [[ "$line" =~ ^##[[:space:]]Doc:[[:space:]](docs/[^[:space:]]+\.md) ]]; then
    current_doc="${BASH_REMATCH[1]}"
    in_linking_section=0
    in_excluded_section=0
    doc_files["$current_doc"]=""
    continue
  fi

  # Sección "## Excluidos"
  if [[ "$line" =~ ^##[[:space:]]Excluidos ]]; then
    in_excluded_section=1
    in_linking_section=0
    current_doc=""
    continue
  fi

  # Cualquier otra sección ## (ej. "## Grafo de relaciones")
  if [[ "$line" =~ ^##[[:space:]] ]]; then
    in_linking_section=0
    in_excluded_section=0
    current_doc=""
    continue
  fi

  # Subsección "### Ficheros que enlazan" dentro de un Doc
  if [[ -n "$current_doc" && "$line" =~ ^###[[:space:]] && "$line" =~ Ficheros ]]; then
    in_linking_section=1
    continue
  fi

  # Otra subsección ### dentro de un Doc → salir de linking
  if [[ "$line" =~ ^###[[:space:]] ]]; then
    in_linking_section=0
    continue
  fi

  # Bullet con ruta en backticks en "Ficheros que enlazan"
  if [[ $in_linking_section -eq 1 && "$line" =~ \`([^\`]+)\` ]]; then
    f="${BASH_REMATCH[1]}"
    doc_files["$current_doc"]+=" $f"
    file_to_doc["$f"]="$current_doc"
    continue
  fi

  # Bullet con ruta en backticks en "## Excluidos"
  if [[ $in_excluded_section -eq 1 && "$line" =~ \`([^\`]+)\` ]]; then
    f="${BASH_REMATCH[1]}"
    excluded_files["$f"]=1
    continue
  fi

done < "$MAP"

# ---------------------------------------------------------------------------
# 2. Recopilar todos los @linked del código fuente
#    Extensiones: .ts .html .css .js .cjs .d.ts
#    Excluir: node_modules, .git, dist, analysis/
# ---------------------------------------------------------------------------

declare -A linked_in_file   # linked_in_file[src/foo.ts] = "docs/bar.md" (sin anchor)
declare -A linked_target_in_file  # linked_target_in_file[src/foo.ts] = "docs/bar.md[#anchor]"

# Usamos un fichero temporal para evitar subshell con process substitution en
# versiones de bash que no soporten bien la herencia de variables
TMPFILE="$(mktemp)"
grep -rna "@linked" \
    --include="*.ts" --include="*.html" --include="*.css" \
    --include="*.js" --include="*.cjs" --include="*.d.ts" \
    --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist \
    --exclude-dir=analysis \
    "$REPO_ROOT/src" "$REPO_ROOT/scripts" 2>/dev/null > "$TMPFILE" || true

while IFS= read -r hit; do
  # hit: /abs/path/file.ts:N:... @linked docs/foo.md[#anchor]
  abs_path="${hit%%:*}"
  rest="${hit#*:}"         # quitar abs_path:
  rest="${rest#*:}"        # quitar número de línea:

  # Ruta relativa al repo (con forward slashes)
  rel_path="${abs_path#$REPO_ROOT/}"
  rel_path="${rel_path//\\//}"

  # Extraer el argumento de @linked
  if [[ "$rest" =~ @linked[[:space:]]+([^[:space:]]+) ]]; then
    linked_target="${BASH_REMATCH[1]}"
    linked_doc="${linked_target%%#*}"
    anchor=""
    if [[ "$linked_target" == *"#"* ]]; then
      anchor="${linked_target#*#}"
    fi

    linked_in_file["$rel_path"]="$linked_doc"
    linked_target_in_file["$rel_path"]="$linked_target"

    # -------------------------------------------------------------------
    # CHECK 1a: LINK_ROTO — ¿existe el fichero doc?
    # -------------------------------------------------------------------
    doc_abs="$REPO_ROOT/$linked_doc"
    if [[ ! -f "$doc_abs" ]]; then
      emit "LINK_ROTO: $rel_path → $linked_target (fichero doc no existe)"
      continue
    fi

    # -------------------------------------------------------------------
    # CHECK 1b: LINK_ROTO — si hay anchor, ¿existe el heading?
    # -------------------------------------------------------------------
    if [[ -n "$anchor" ]]; then
      heading_found=0
      while IFS= read -r docline; do
        if [[ "$docline" =~ ^#{1,6}[[:space:]]+(.*) ]]; then
          heading_text="${BASH_REMATCH[1]}"
          # Normalizar: minúsculas, espacios→-, quitar caracteres no alfanuméricos excepto -
          normalized=$(printf '%s' "$heading_text" | tr '[:upper:]' '[:lower:]' \
            | tr ' ' '-' | sed 's/[^a-z0-9-]//g')
          if [[ "$normalized" == "$anchor" ]]; then
            heading_found=1
            break
          fi
        fi
      done < "$doc_abs"
      if [[ $heading_found -eq 0 ]]; then
        emit "LINK_ROTO: $rel_path → $linked_target (anchor #$anchor no encontrado en $linked_doc)"
      fi
    fi
  fi

done < "$TMPFILE"
rm -f "$TMPFILE"

# ---------------------------------------------------------------------------
# 3. CHECK 2: SIN_DOC — fichero en _map.md sin @linked en el código
# ---------------------------------------------------------------------------
for f in "${!file_to_doc[@]}"; do
  if [[ -z "${linked_in_file[$f]+x}" ]]; then
    emit "SIN_DOC: $f (listado en _map.md bajo ${file_to_doc[$f]}) pero no tiene @linked"
  fi
done

# ---------------------------------------------------------------------------
# 4. CHECK 3: DOC_HUERFANO — doc bajo docs/ (salvo _map.md y excluidos del
#    patrón) sin ningún @linked que lo referencie
# ---------------------------------------------------------------------------
# Docs explícitamente excluidos del patrón Linked Chunks
EXCLUDED_DOCS=(
  "docs/uml-diagrams.md"
  "docs/propuesta-p14.md"
  "docs/propuesta-p15.md"
  "docs/STOPP_START_CRITERIOS_CONTEXTO.md"
  "docs/dudas-raquel-pendientes.md"
  "docs/revision-criterios-d-h.md"
  "docs/plan-visibilidad-medicamentos-multiclase.md"
  "docs/revision-visibilidad-clinica-por-sistema.md"
  "docs/revision-prueba-manual-visibilidad-multiclase.md"
  "docs/revision-pendientes-relevancia.md"
  "docs/revision-pendientes-relevancia-resultado.md"
  "docs/revision-dosis-duracion-medicacion.md"
)

for doc_abs in "$REPO_ROOT"/docs/*.md; do
  doc_rel="docs/$(basename "$doc_abs")"
  [[ "$doc_rel" == "docs/_map.md" ]] && continue

  is_excluded=0
  for excl in "${EXCLUDED_DOCS[@]}"; do
    [[ "$doc_rel" == "$excl" ]] && is_excluded=1
  done
  [[ $is_excluded -eq 1 ]] && continue

  # ¿Algún @linked apunta a este doc?
  referenced=0
  for f in "${!linked_in_file[@]}"; do
    target="${linked_in_file[$f]}"
    if [[ "$target" == "$doc_rel" ]]; then
      referenced=1
      break
    fi
  done
  if [[ $referenced -eq 0 ]]; then
    emit "DOC_HUERFANO: $doc_rel no está referenciado por ningún @linked"
  fi
done

# ---------------------------------------------------------------------------
# 5. CHECK 4: FUERA_DE_MAPA
#    (a) fichero con @linked cuyo doc no aparece como "## Doc:" en _map.md
#    (b) fichero con @linked no listado bajo ese doc en _map.md
#        (a menos que esté en la sección Excluidos del mapa)
#    (c) doc bajo docs/ sin entrada "## Doc:" en _map.md
#        (salvo _map.md y docs excluidos del patrón)
# ---------------------------------------------------------------------------

# (a) y (b)
for f in "${!linked_in_file[@]}"; do
  linked_doc="${linked_in_file[$f]}"

  # (a) ¿El doc está declarado en _map.md?
  if [[ -z "${doc_files[$linked_doc]+x}" ]]; then
    emit "FUERA_DE_MAPA: $f tiene @linked $linked_doc pero ese doc no aparece en _map.md"
    continue
  fi

  # (b) ¿El fichero está listado en _map.md?
  if [[ -n "${file_to_doc[$f]+x}" ]]; then
    # Sí está en el mapa — verificar que apunta al doc correcto
    mapped_doc="${file_to_doc[$f]}"
    if [[ "$mapped_doc" != "$linked_doc" ]]; then
      emit "FUERA_DE_MAPA: $f tiene @linked $linked_doc pero _map.md lo asigna a $mapped_doc"
    fi
  else
    # El fichero no aparece en ningún doc del mapa — ¿está excluido?
    if [[ -z "${excluded_files[$f]+x}" ]]; then
      emit "FUERA_DE_MAPA: $f tiene @linked $linked_doc pero no está listado en _map.md"
    fi
    # Si está excluido, no se reporta
  fi
done

# (c) docs sin entrada en _map.md
for doc_abs in "$REPO_ROOT"/docs/*.md; do
  doc_rel="docs/$(basename "$doc_abs")"
  [[ "$doc_rel" == "docs/_map.md" ]] && continue

  is_excluded=0
  for excl in "${EXCLUDED_DOCS[@]}"; do
    [[ "$doc_rel" == "$excl" ]] && is_excluded=1
  done
  [[ $is_excluded -eq 1 ]] && continue

  if [[ -z "${doc_files[$doc_rel]+x}" ]]; then
    emit "FUERA_DE_MAPA: $doc_rel existe en docs/ pero no tiene entrada ## Doc: en _map.md"
  fi
done

# ---------------------------------------------------------------------------
# Resultado final
# ---------------------------------------------------------------------------
if [[ $problems -eq 0 ]]; then
  echo "OK: todo limpio (0 problemas)"
  exit 0
else
  echo "TOTAL: $problems problema(s)"
  exit 1
fi
