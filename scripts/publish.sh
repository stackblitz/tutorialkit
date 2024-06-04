#!/usr/bin/env bash

# if no tag is specified we'll use 'latest' as the default
TAG=${1:-latest}

pnpm build && pnpm publish --recursive --tag "$TAG" --filter "@tutorialkit/*" --filter "tutorialkit" "$@"
