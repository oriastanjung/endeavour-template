import fs from "fs";
import path from "path";

const partsDir = path.join(process.cwd(), "prisma/schemas");
const outputFile = path.join(process.cwd(), "prisma/schema.prisma");

const header = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}
`;

let models = "";

// Loop semua file di prisma/parts/*.prisma
for (const file of fs.readdirSync(partsDir)) {
  const content = fs.readFileSync(path.join(partsDir, file), "utf8");
  models += "\n" + content;
}

// Tulis schema.prisma hasil gabungan
fs.writeFileSync(outputFile, header + models);

console.log("✅ Prisma schema merged into schema.prisma");
