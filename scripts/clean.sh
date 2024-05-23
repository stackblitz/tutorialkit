#!/usr/bin/env bash

find . -name "*.tsbuildinfo" -type f -delete
find packages -maxdepth 2 -name "dist" -type d -exec rm -rf {} +
