import { PrismaClient } from "@prisma/client";

// Vercel's Postgres/Neon integration prefixes its env vars with the storage
// name (e.g. "EDU_POSTGRES_PRISMA_URL") instead of the plain names Prisma
// expects. Alias them here so the schema's env("POSTGRES_PRISMA_URL") /
// env("POSTGRES_URL_NON_POOLING") resolve regardless of the prefix used.
function aliasPrefixedEnv(targetName: string) {
  if (process.env[targetName]) return;
  const match = Object.keys(process.env).find((key) => key.endsWith(`_${targetName}`));
  if (match) process.env[targetName] = process.env[match];
}
aliasPrefixedEnv("POSTGRES_PRISMA_URL");
aliasPrefixedEnv("POSTGRES_URL_NON_POOLING");

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
