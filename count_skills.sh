#!/bin/bash
# Print each skill Claude Code opened in a `claude -p --output-format stream-json --verbose` record.
# No output means the Skill tool was never called.
jq -c 'select(.type=="assistant") | .message.content[] | select(.type=="tool_use" and .name=="Skill") | .input.skill' "$1"
