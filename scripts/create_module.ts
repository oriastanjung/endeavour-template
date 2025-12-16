import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { spawnSync } from "child_process";

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 PRETTY LOGGER
// ═══════════════════════════════════════════════════════════════════════════════

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  bgGreen: "\x1b[42m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
};

const log = {
  title: (msg: string) =>
    console.log(
      `\n${colors.bgMagenta}${colors.white}${colors.bright} 🚀 ${msg} ${colors.reset}\n`
    ),
  step: (num: number, msg: string) =>
    console.log(
      `${colors.cyan}${colors.bright}[Step ${num}]${colors.reset} ${colors.white}${msg}${colors.reset}`
    ),
  success: (msg: string) =>
    console.log(`  ${colors.green}✓${colors.reset} ${msg}`),
  info: (msg: string) =>
    console.log(
      `  ${colors.blue}ℹ${colors.reset} ${colors.dim}${msg}${colors.reset}`
    ),
  warn: (msg: string) =>
    console.log(`  ${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`  ${colors.red}✗${colors.reset} ${msg}`),
  file: (action: string, filePath: string) =>
    console.log(
      `  ${colors.green}📄${colors.reset} ${action}: ${colors.cyan}${filePath}${colors.reset}`
    ),
  divider: () =>
    console.log(
      `${colors.dim}───────────────────────────────────────────────────────────${colors.reset}`
    ),
  done: () =>
    console.log(
      `\n${colors.bgGreen}${colors.white}${colors.bright} ✨ Module created successfully! ✨ ${colors.reset}\n`
    ),
  command: (cmd: string) =>
    console.log(
      `  ${colors.magenta}⚡${colors.reset} Running: ${colors.cyan}${cmd}${colors.reset}`
    ),
  commandSuccess: (cmd: string, time: number) =>
    console.log(
      `  ${colors.green}✓${colors.reset} ${cmd} ${colors.dim}(${time}ms)${colors.reset}`
    ),
  commandFail: (cmd: string) =>
    console.log(`  ${colors.red}✗${colors.reset} ${cmd} failed`),
};

function runCommand(command: string, args: string[]): boolean {
  const fullCmd = `${command} ${args.join(" ")}`;
  log.command(fullCmd);

  const startTime = Date.now();
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: true,
    cwd: process.cwd(),
  });
  const elapsed = Date.now() - startTime;

  if (result.status === 0) {
    log.commandSuccess(fullCmd, elapsed);
    return true;
  } else {
    log.commandFail(fullCmd);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(`${colors.yellow}? ${colors.reset}${question}`, (answer) => {
      resolve(answer.trim());
    });
  });
}

function askYesNo(question: string): Promise<boolean> {
  return new Promise((resolve) => {
    rl.question(
      `${colors.yellow}? ${colors.reset}${question} ${colors.dim}(y/n)${colors.reset} `,
      (answer) => {
        resolve(answer.toLowerCase() === "y" || answer.toLowerCase() === "yes");
      }
    );
  });
}

function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^(.)/, (c) => c.toUpperCase());
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();
}

function pluralize(str: string): string {
  if (str.endsWith("s")) return str;
  if (str.endsWith("y")) return str.slice(0, -1) + "ies";
  if (str.endsWith("ch") || str.endsWith("sh") || str.endsWith("x"))
    return str + "es";
  return str + "s";
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📝 TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

function generatePrismaSchema(moduleName: string, tableName: string): string {
  return `model ${moduleName} {
    id        String   @id @default(uuid())
    name      String
    createdAt DateTime @default(now()) @map("created_at")
    updatedAt DateTime @updatedAt @map("updated_at")

    @@map("${tableName}")
}
`;
}

function generateEntityFile(moduleName: string, withPrisma: boolean): string {
  const prismaImport = withPrisma
    ? `import { ${moduleName} } from "@prisma/client";\n`
    : "";
  const typeExport = withPrisma
    ? `export type ${moduleName}Model = ${moduleName};`
    : `export type ${moduleName}Model = {\n  id: string;\n  name: string;\n  createdAt: Date;\n  updatedAt: Date;\n};`;

  return `import { z } from "zod";
${prismaImport}
// START SCHEMA

${typeExport}

export const GetAll${moduleName}Schema = z.object({
  page: z.number(),
  limit: z.number(),
  keyword: z.string(),
  sortBy: z.enum(["latest", "oldest"]),
});

export const Create${moduleName}Schema = z.object({
  name: z.string(),
});

export type Create${moduleName}Model = z.infer<typeof Create${moduleName}Schema>;

export const Update${moduleName}Schema = z.object({
  id: z.string(),
  name: z.string(),
});

export type Update${moduleName}Model = z.infer<typeof Update${moduleName}Schema>;
// END SCHEMA
`;
}

function generateServiceFile(moduleName: string): string {
  const camelName = toCamelCase(moduleName);
  return `import type { I${moduleName}Repository } from "./${moduleName}.repository";
import type { ${moduleName}Model } from "./${moduleName}.entity";
import type { PaginationWrapper } from "@/backend/dto/pagination";
import { Prisma } from "@prisma/client";

export class ${moduleName}Service implements I${moduleName}ServiceInterface {
  constructor(private readonly ${camelName}Repository: I${moduleName}Repository) {}

  async getAll${pluralize(moduleName)}({
    page,
    limit,
    keyword,
    sortBy,
  }: {
    page: number;
    limit: number;
    keyword: string;
    sortBy: string;
  }) {
    return await this.${camelName}Repository.getAll${pluralize(moduleName)}({
      page,
      limit,
      keyword,
      sortBy,
    });
  }

  async getOne${moduleName}ById(id: string) {
    return await this.${camelName}Repository.getOne${moduleName}ById(id);
  }

  async create${moduleName}(${camelName}: Prisma.${moduleName}CreateInput) {
    return await this.${camelName}Repository.create${moduleName}(${camelName});
  }

  async update${moduleName}(id: string, ${camelName}: Prisma.${moduleName}UpdateInput) {
    return await this.${camelName}Repository.update${moduleName}(id, ${camelName});
  }

  async delete${moduleName}(id: string) {
    return await this.${camelName}Repository.delete${moduleName}(id);
  }
}

interface I${moduleName}ServiceInterface {
  getAll${pluralize(moduleName)}: ({
    page,
    limit,
    keyword,
    sortBy,
  }: {
    page: number;
    limit: number;
    keyword: string;
    sortBy: string;
  }) => Promise<PaginationWrapper<${moduleName}Model[]>>;
  getOne${moduleName}ById: (id: string) => Promise<${moduleName}Model>;
  create${moduleName}: (
    ${camelName}: Prisma.${moduleName}CreateInput
  ) => Promise<${moduleName}Model>;
  update${moduleName}: (
    id: string,
    ${camelName}: Prisma.${moduleName}UpdateInput
  ) => Promise<${moduleName}Model>;
  delete${moduleName}: (id: string) => Promise<void>;
}
`;
}

function generateRepositoryFile(moduleName: string): string {
  const camelName = toCamelCase(moduleName);
  return `import { Prisma } from "@prisma/client";
import { db } from "@/shared/database";
import type { PaginationWrapper } from "@/backend/dto/pagination";
import type { ${moduleName}Model } from "./${moduleName}.entity";

export class ${moduleName}Repository implements I${moduleName}Repository {
  async getAll${pluralize(moduleName)}({
    page,
    limit,
    keyword,
    sortBy,
  }: {
    page: number;
    limit: number;
    keyword: string;
    sortBy: string;
  }): Promise<PaginationWrapper<${moduleName}Model[]>> {
    const whereConditions: Prisma.${moduleName}WhereInput = {};

    // Add keyword search conditions
    if (keyword) {
      whereConditions.OR = [
        { name: { contains: keyword, mode: "insensitive" } },
      ];
    }

    // Count total items for pagination
    const total_items = await db.${camelName}.count({
      where: whereConditions,
    });

    // Fetch paginated data
    const allData = await db.${camelName}.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: whereConditions,
      orderBy: {
        createdAt: sortBy === "oldest" ? "asc" : "desc",
      },
    });

    return {
      data: allData,
      total_pages: Math.ceil(total_items / limit),
      current_page: page,
      per_page: limit,
      total_items,
    };
  }

  async getOne${moduleName}ById(id: string): Promise<${moduleName}Model> {
    const ${camelName} = await db.${camelName}.findUnique({
      where: { id },
    });
    if (!${camelName}) {
      throw new Error("${moduleName} not found");
    }
    return ${camelName};
  }

  async create${moduleName}(
    ${camelName}: Prisma.${moduleName}CreateInput
  ): Promise<${moduleName}Model> {
    const response = await db.${camelName}.create({
      data: ${camelName},
    });
    return response;
  }

  async update${moduleName}(
    id: string,
    ${camelName}: Prisma.${moduleName}UpdateInput
  ): Promise<${moduleName}Model> {
    const response = await db.${camelName}.update({
      where: { id },
      data: ${camelName},
    });
    return response;
  }

  async delete${moduleName}(id: string): Promise<void> {
    await db.${camelName}.delete({
      where: { id },
    });
  }
}

export interface I${moduleName}Repository {
  getAll${pluralize(moduleName)}: ({
    page,
    limit,
    keyword,
    sortBy,
  }: {
    page: number;
    limit: number;
    keyword: string;
    sortBy: string;
  }) => Promise<PaginationWrapper<${moduleName}Model[]>>;
  getOne${moduleName}ById: (id: string) => Promise<${moduleName}Model>;
  create${moduleName}: (${camelName}: Prisma.${moduleName}CreateInput) => Promise<${moduleName}Model>;
  update${moduleName}: (
    id: string,
    ${camelName}: Prisma.${moduleName}UpdateInput
  ) => Promise<${moduleName}Model>;
  delete${moduleName}: (id: string) => Promise<void>;
}
`;
}

function generateRouteFile(moduleName: string): string {
  const camelName = toCamelCase(moduleName);
  return `import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import {
  Create${moduleName}Schema,
  GetAll${moduleName}Schema,
  Update${moduleName}Schema,
  type Create${moduleName}Model,
} from "./${moduleName}.entity";
import { z } from "zod";

export class ${moduleName}Router {
  generateRouter() {
    return createTRPCRouter({
      getAll${pluralize(moduleName)}: baseProcedure
        .input(GetAll${moduleName}Schema)
        .query(async ({ input, ctx }) => {
          return await ctx.container.${camelName}Service.getAll${pluralize(
    moduleName
  )}(input);
        }),
      getOne${moduleName}ById: baseProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
          return await ctx.container.${camelName}Service.getOne${moduleName}ById(
            input.id
          );
        }),
      create${moduleName}: baseProcedure
        .input(Create${moduleName}Schema)
        .mutation(async ({ input, ctx }) => {
          const inputData: Create${moduleName}Model = {
            name: input.name,
          };
          return await ctx.container.${camelName}Service.create${moduleName}(
            inputData
          );
        }),
      update${moduleName}: baseProcedure
        .input(Update${moduleName}Schema)
        .mutation(async ({ input, ctx }) => {
          return await ctx.container.${camelName}Service.update${moduleName}(
            input.id,
            input
          );
        }),
      delete${moduleName}: baseProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ input, ctx }) => {
          return await ctx.container.${camelName}Service.delete${moduleName}(input.id);
        }),
    });
  }
}
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📁 FILE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function injectIntoFile(
  filePath: string,
  marker: string,
  content: string
): void {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const lines = fileContent.split("\n");

  const markerIndex = lines.findIndex((line) => line.includes(marker));
  if (markerIndex === -1) {
    log.warn(`Marker "${marker}" not found in ${filePath}`);
    return;
  }

  lines.splice(markerIndex, 0, content);
  fs.writeFileSync(filePath, lines.join("\n"));
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 MAIN SCRIPT
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  const rootDir = process.cwd();
  const modulesDir = path.join(rootDir, "src", "backend", "modules");
  const prismaDir = path.join(rootDir, "prisma", "schemas");
  const appFilePath = path.join(rootDir, "src", "backend", "_app.ts");
  const containerFilePath = path.join(
    rootDir,
    "src",
    "backend",
    "containers",
    "container.ts"
  );

  log.title("MODULE GENERATOR");

  // ─────────────────────────────────────────────────────────────────────────────
  // Step 1: Get module name
  // ─────────────────────────────────────────────────────────────────────────────
  log.step(1, "Module Configuration");
  const rawModuleName = await ask("Enter module name: ");

  if (!rawModuleName) {
    log.error("Module name is required!");
    rl.close();
    process.exit(1);
  }

  const moduleName = toPascalCase(rawModuleName);
  const camelName = toCamelCase(moduleName);
  const snakeName = toSnakeCase(moduleName);
  const tableName = `tbl_${pluralize(snakeName)}`;

  log.success(`Module name: ${moduleName}`);
  log.info(`camelCase: ${camelName}`);
  log.info(`snake_case: ${snakeName}`);
  log.info(`Table name: ${tableName}`);

  log.divider();

  // ─────────────────────────────────────────────────────────────────────────────
  // Step 2: Prisma schema
  // ─────────────────────────────────────────────────────────────────────────────
  log.step(2, "Prisma Schema");
  const createSchema = await askYesNo("Create Prisma schema?");

  if (createSchema) {
    ensureDir(prismaDir);
    const schemaPath = path.join(prismaDir, `${moduleName}.prisma`);
    fs.writeFileSync(schemaPath, generatePrismaSchema(moduleName, tableName));
    log.file("Created", `prisma/schemas/${moduleName}.prisma`);
    log.warn(
      "Remember to run: bun run prisma:merge && bun run prisma:generate"
    );
  } else {
    log.info("Skipping Prisma schema creation");
  }

  log.divider();

  // ─────────────────────────────────────────────────────────────────────────────
  // Step 3: Select version
  // ─────────────────────────────────────────────────────────────────────────────
  log.step(3, "Version Selection");

  const existingVersions = fs
    .readdirSync(modulesDir)
    .filter(
      (dir) =>
        dir.startsWith("v") &&
        fs.statSync(path.join(modulesDir, dir)).isDirectory()
    );

  if (existingVersions.length > 0) {
    log.info(`Existing versions: ${existingVersions.join(", ")}`);
  } else {
    log.info("No existing versions found");
  }

  const versionInput = await ask("Enter version (e.g., v1, v2): ");
  const version = versionInput.startsWith("v")
    ? versionInput
    : `v${versionInput}`;
  const versionDir = path.join(modulesDir, version);
  ensureDir(versionDir);
  log.success(`Version: ${version}`);

  log.divider();

  // ─────────────────────────────────────────────────────────────────────────────
  // Step 4: Create module folder
  // ─────────────────────────────────────────────────────────────────────────────
  log.step(4, "Creating Module Files");

  const moduleDir = path.join(versionDir, moduleName);

  if (fs.existsSync(moduleDir)) {
    log.error(`Module ${moduleName} already exists in ${version}!`);
    rl.close();
    process.exit(1);
  }

  ensureDir(moduleDir);
  log.success(`Created module directory: ${version}/${moduleName}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // Step 5: Generate files
  // ─────────────────────────────────────────────────────────────────────────────
  const files = [
    {
      name: `${moduleName}.entity.ts`,
      content: generateEntityFile(moduleName, createSchema),
    },
    {
      name: `${moduleName}.service.ts`,
      content: generateServiceFile(moduleName),
    },
    {
      name: `${moduleName}.repository.ts`,
      content: generateRepositoryFile(moduleName),
    },
    { name: `${moduleName}.route.ts`, content: generateRouteFile(moduleName) },
  ];

  for (const file of files) {
    const filePath = path.join(moduleDir, file.name);
    fs.writeFileSync(filePath, file.content);
    log.file("Created", `${version}/${moduleName}/${file.name}`);
  }

  log.divider();

  // ─────────────────────────────────────────────────────────────────────────────
  // Step 6: Inject into _app.ts
  // ─────────────────────────────────────────────────────────────────────────────
  log.step(5, "Injecting into _app.ts");

  const routerImport = `import { ${moduleName}Router } from "./modules/${version}/${moduleName}/${moduleName}.route";`;
  const routerInstance = `  ${camelName}: new ${moduleName}Router().generateRouter(),`;

  injectIntoFile(appFilePath, "// END: INJECT MODULE ROUTER", routerImport);
  injectIntoFile(appFilePath, "  // END: INJECT MODULE ROUTER", routerInstance);

  log.success(`Injected ${moduleName}Router into _app.ts`);

  log.divider();

  // ─────────────────────────────────────────────────────────────────────────────
  // Step 7: Inject into container.ts
  // ─────────────────────────────────────────────────────────────────────────────
  log.step(6, "Injecting into container.ts");

  const serviceImport = `import { ${moduleName}Service } from "../modules/${version}/${moduleName}/${moduleName}.service";`;
  const repositoryImport = `import { ${moduleName}Repository } from "../modules/${version}/${moduleName}/${moduleName}.repository";`;
  const repositorySingleton = `  ${camelName}Repository: new ${moduleName}Repository(),`;
  const serviceInstance = `  ${camelName}Service: new ${moduleName}Service(singletons.${camelName}Repository),`;

  injectIntoFile(
    containerFilePath,
    "// END: INJECT MODULE SERVICE",
    serviceImport
  );
  injectIntoFile(
    containerFilePath,
    "// END: INJECT MODULE REPOSITORY",
    repositoryImport
  );
  injectIntoFile(
    containerFilePath,
    "  // END: INJECT MODULE REPOSITORY",
    repositorySingleton
  );
  injectIntoFile(
    containerFilePath,
    "  // END: INJECT MODULE SERVICE",
    serviceInstance
  );

  log.success(`Injected ${moduleName} dependencies into container.ts`);

  log.divider();

  // ─────────────────────────────────────────────────────────────────────────────
  // Step 7: Run Prisma commands (if schema was created)
  // ─────────────────────────────────────────────────────────────────────────────
  if (createSchema) {
    log.step(7, "Running Prisma Commands");

    const mergeSuccess = runCommand("bun", ["run", "prisma:merge"]);
    if (!mergeSuccess) {
      log.error("prisma:merge failed. Please run it manually.");
    }

    const generateSuccess = runCommand("bun", ["run", "prisma:generate"]);
    if (!generateSuccess) {
      log.error("prisma:generate failed. Please run it manually.");
    }

    log.divider();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Done!
  // ─────────────────────────────────────────────────────────────────────────────
  log.done();

  console.log(`${colors.dim}Next steps:${colors.reset}`);
  if (createSchema) {
    console.log(
      `  • Run ${colors.cyan}bun run prisma:push${colors.reset} to push schema to database`
    );
  }
  console.log(
    `  • Access your module via ${colors.cyan}trpc.${camelName}.*${colors.reset}\n`
  );

  rl.close();
}

main().catch((err) => {
  log.error(err.message);
  rl.close();
  process.exit(1);
});
