#!/bin/bash
# Re-run one setup of the test. Each call is one `claude -p` run in a fresh copy of a blank Remotion project.
#   bash run_lab.sh setup                 # once: creates base/ (no skills) and withskill/ (Remotion skills) in the current folder
#   bash run_lab.sh <id> <job> <setup>    # job: text | captions | map
#                                      # setup: none | skill | name | md
#     none  = no Remotion skills installed
#     skill = Remotion skills installed, prompt unchanged
#     name  = skills installed, prompt starts with "Use the remotion-best-practices skill."
#     md    = skills installed, CLAUDE.md from prompts/CLAUDE.md
# Example: bash run_lab.sh g1 map name   -> g1/ and g1.jsonl
# Run it in a lab folder outside any project, so no parent CLAUDE.md is picked up.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"

if [ "$1" = setup ]; then
  npx --yes create-video@latest --yes --blank base
  npx --yes create-video@latest --yes --blank --skills withskill
  for p in base withskill; do
    # we pinned 4.0.543 (4.0.545 was too new for our npm settings on 2026-11-19)
    (cd $p && sed -i '' 's/4\.0\.545/4.0.543/g' package.json && npm install --loglevel=error)
  done
  exit 0
fi

id=$1; job=$2; setup=$3
P="$(cat "$HERE/prompts/$job.txt")"
cp -cR base "$id"   # macOS clone copy; use `cp -R` elsewhere
[ "$job" = captions ] && cp "$HERE/captions.json" "$id/public/"
if [ "$setup" != none ]; then
  cp -R withskill/.agents "$id/"
  mkdir -p "$id/.claude" && ln -sfn ../.agents/skills "$id/.claude/skills"
fi
[ "$setup" = name ] && P="Use the remotion-best-practices skill. $P"
[ "$setup" = md ] && cp "$HERE/prompts/CLAUDE.md" "$id/CLAUDE.md"

TOOLS=("Read" "Write" "Edit" "Glob" "Grep" "Skill" "Bash(npx remotion *)" "Bash(npm run *)" "Bash(ls *)" "Bash(cat *)" "Bash(npx tsc *)")
TURNS=40
[ "$job" = captions ] && TOOLS+=("Bash(npm install *)" "Bash(npm i *)")
if [ "$job" = map ]; then
  TOOLS+=("WebFetch" "Bash(npm install *)" "Bash(npm i *)" "Bash(curl *)"); TURNS=60
fi

(cd "$id" && claude -p "$P" --setting-sources project --strict-mcp-config \
  --output-format stream-json --verbose --max-turns $TURNS \
  --allowedTools "${TOOLS[@]}" > "../$id.jsonl" 2> "../$id.err")

echo "$id: Skill calls:"
bash "$HERE/count_skills.sh" "$id.jsonl"
