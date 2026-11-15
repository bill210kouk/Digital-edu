#!/bin/bash
set -e

# Vercel's Postgres/Neon storage integration prefixes its env vars with the
# storage name (currently "EDU_") instead of the plain names Prisma expects.
# Fall back to the prefixed names here so `prisma db push` can find the
# database during the build. If the storage is ever recreated under a
# different name, update the fallback variable names below.
if [ -n "$EDU_POSTGRES_PRISMA_URL" ]; then
  export POSTGRES_PRISMA_URL="${POSTGRES_PRISMA_URL:-$EDU_POSTGRES_PRISMA_URL}"
fi
if [ -n "$EDU_POSTGRES_URL_NON_POOLING" ]; then
  export POSTGRES_URL_NON_POOLING="${POSTGRES_URL_NON_POOLING:-$EDU_POSTGRES_URL_NON_POOLING}"
fi

prisma generate
prisma db push --accept-data-loss --skip-generate
next build
