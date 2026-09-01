#!/usr/bin/env bash
set -e

echo "🔍 [PAPYRUS QUALITY GATE] Validating starter template schemas & e2e..."
npx tsx scripts/test-e2e.ts > /dev/null

echo "🔍 [PAPYRUS QUALITY GATE] Running field editing stress test..."
npx tsx scripts/test-field-editing.ts > /dev/null

echo "🔍 [PAPYRUS QUALITY GATE] Running TypeScript type check..."
npx tsc --noEmit

echo "✅ [PAPYRUS QUALITY GATE] All pre-commit checks passed successfully!"
