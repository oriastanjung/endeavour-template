import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { DATABASE_URL } from "@/config";

const connectionString = `${DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });

export { db };
