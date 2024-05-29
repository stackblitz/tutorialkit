#!/usr/bin/env bash

pnpm build && pnpm publish --recursive --tag dev --filter "@tutorialkit/*" --filter "tutorialkit" "$@"
