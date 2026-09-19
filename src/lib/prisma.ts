import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { logger } from "../config/logger";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const prisma = new PrismaClient({
  adapter,
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "error",
    },
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
  ],
});

prisma.$on("error", (e) => {
  logger.error(e);
});
prisma.$on("info", (e) => {
  logger.info(e);
});
prisma.$on("query", (e) => {
  logger.info(e);
});
prisma.$on("warn", (e) => {
  logger.warn(e);
});
