import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

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
      `\n${colors.bgGreen}${colors.white}${colors.bright} ✨ Node created successfully! ✨ ${colors.reset}\n`
    ),
};

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

function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^(.)/, (c) => c.toUpperCase());
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function injectIntoFile(
  filePath: string,
  marker: string,
  content: string,
  mode: "before" | "after" = "before"
): void {
  try {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const lines = fileContent.split("\n");

    const markerIndex = lines.findIndex((line) => line.includes(marker));
    if (markerIndex === -1) {
      log.warn(`Marker "${marker}" not found in ${filePath}`);
      return;
    }

    const insertIndex = mode === "before" ? markerIndex : markerIndex + 1;
    lines.splice(insertIndex, 0, content);
    fs.writeFileSync(filePath, lines.join("\n"));
    log.success(`Injected into ${path.basename(filePath)}`);
  } catch (error) {
    log.error(`Failed to inject into ${filePath}: ${error}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📝 TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

function generateActionFile(pascalName: string): string {
  return `import type { NodeAction } from "../../../backend";
import type { ${pascalName}NodeConfig } from "../sheet";

export const ${pascalName}NodeAction: NodeAction = async (input, ctx) => {
  const config = input as ${pascalName}NodeConfig;
  await ctx.log("info", "${pascalName} node action", { config });
  return {
    output: config.data,
    nextEdgeLabel: undefined,
  };
};
`;
}

function generateSheetFile(pascalName: string): string {
  return `import { z } from "zod";

export const ${toCamelCase(pascalName)}NodeSchema = z.object({
  data: z.string().default(""),
});

export type ${pascalName}NodeConfig = z.infer<typeof ${toCamelCase(
    pascalName
  )}NodeSchema>;

export const ${toCamelCase(pascalName)}NodeDefaults: ${pascalName}NodeConfig = {
  data: "",
};
`;
}

function generateFormFile(pascalName: string): string {
  return `"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { MentionTextarea } from "../../../ui/components/mention-textarea";
import type { WorkflowNode } from "../../../types/Workflow";
import type { ${pascalName}NodeConfig } from "../sheet";

export interface NodeFormProps {
  data: ${pascalName}NodeConfig;
  updateData: (key: string, value: unknown) => void;
  nodes: WorkflowNode[];
}

export const ${pascalName}NodeForm: React.FC<NodeFormProps> = ({
  data,
  updateData,
  nodes,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Data</Label>
        <MentionTextarea
          value={(data.data as string) || ""}
          onChangeValue={(val) => updateData("data", val)}
          nodes={nodes}
          placeholder="{{variable}}"
          className="min-h-[40px]"
        />
        <p className="text-xs text-muted-foreground">
          Supports Handlebars templates: {"{{variable}}"}
        </p>
      </div>
    </div>
  );
};

export default ${pascalName}NodeForm;
`;
}

function generateUiIndexFile(
  pascalName: string,
  config: { type: string; label: string }
): string {
  return `import { memo } from "react";
import { Position, type NodeProps } from "@xyflow/react";
import { NodeWrapper } from "../../node-wrapper";
import { Code2 } from "lucide-react";
import type { WorkflowNode } from "../../../types/Workflow";

export const ${pascalName}Node = memo(
  ({ id, data, selected }: NodeProps<WorkflowNode>) => {
    return (
      <NodeWrapper
        id={id}
        data={data}
        selected={selected}
        title="${config.label}"
        icon={Code2}
        handles={{
          source: [Position.Right],
          target: [Position.Left],
        }}
        className="border-blue-500/50"
        onEdit={() =>
          document.dispatchEvent(
            new CustomEvent("open-node-properties", {
              detail: { id, type: "${config.type}" },
            })
          )
        }
      ></NodeWrapper>
    );
  }
);

${pascalName}Node.displayName = "${pascalName}Node";
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🚀 MAIN SCRIPT
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  const rootDir = process.cwd();
  const workflowDir = path.join(
    rootDir,
    "src",
    "shared",
    "modules",
    "workflow"
  );
  const nodesDir = path.join(workflowDir, "nodes");

  log.title("WORKFLOW NODE GENERATOR");

  // 1. Get Node Name
  log.step(1, "Node Configuration");
  const rawNodeName = await ask("Enter node name (e.g., Openai): ");
  if (!rawNodeName) {
    log.error("Node name is required!");
    rl.close();
    process.exit(1);
  }

  // 2. Get Category
  const categories = ["Triggers", "Actions", "Logic", "Data", "Custom"];
  log.info(`Categories: ${categories.join(", ")}`);
  const categoryRaw = await ask("Enter node category: ");
  const category = categories.find(
    (c) => c.toLowerCase() === categoryRaw.toLowerCase()
  );

  if (!category) {
    log.error(`Invalid category. Must be one of: ${categories.join(", ")}`);
    rl.close();
    process.exit(1);
  }

  // Strip "Node" suffix if present (case-insensitive) to avoid duplication
  // e.g. "TestNode" -> "Test"
  const cleanNodeName = rawNodeName.replace(/node$/i, "");

  const pascalName = toPascalCase(cleanNodeName);
  const kebabName = toKebabCase(cleanNodeName);
  const typeName = kebabName; // e.g. "openai" or "test"
  const folderName = `${kebabName}-node`; // e.g. "openai-node" or "test-node"

  log.success(`Node Name: ${pascalName}`);
  log.info(`Type: ${typeName}`);
  log.info(`Folder: nodes/${folderName}`);
  log.info(`Category: ${category}`);

  // 3. Create Files
  log.divider();
  log.step(2, "Creating Files");

  const nodeDir = path.join(nodesDir, folderName);
  const actionDir = path.join(nodeDir, "action");
  const sheetDir = path.join(nodeDir, "sheet");
  const uiDir = path.join(nodeDir, "ui");

  if (fs.existsSync(nodeDir)) {
    log.error(`Node directory ${folderName} already exists!`);
    rl.close();
    process.exit(1);
  }

  ensureDir(nodeDir);
  ensureDir(actionDir);
  ensureDir(sheetDir);
  ensureDir(uiDir);

  // Write files
  fs.writeFileSync(
    path.join(actionDir, "index.ts"),
    generateActionFile(pascalName)
  );
  log.file("Created", `nodes/${folderName}/action/index.ts`);

  fs.writeFileSync(
    path.join(sheetDir, "index.ts"),
    generateSheetFile(pascalName)
  );
  log.file("Created", `nodes/${folderName}/sheet/index.ts`);

  fs.writeFileSync(path.join(uiDir, "form.tsx"), generateFormFile(pascalName));
  log.file("Created", `nodes/${folderName}/ui/form.tsx`);

  fs.writeFileSync(
    path.join(uiDir, "index.tsx"),
    generateUiIndexFile(pascalName, { type: typeName, label: rawNodeName })
  );
  log.file("Created", `nodes/${folderName}/ui/index.tsx`);

  // 4. Update NodePropertiesSheet.tsx
  log.divider();
  log.step(3, "Updating NodePropertiesSheet.tsx");
  const sheetPath = path.join(
    workflowDir,
    "ui",
    "components",
    "NodePropertiesSheet.tsx"
  );

  injectIntoFile(
    sheetPath,
    "// END INJECTION NODE HERE",
    `import { ${pascalName}NodeForm } from "../../nodes/${folderName}/ui/form";\nimport type { ${pascalName}NodeData } from "../../types/Workflow";`
  );

  injectIntoFile(
    sheetPath,
    "      // END INJECTION NODE HERE",
    `      case "${typeName}":
        return (
          <${pascalName}NodeForm
            data={data as ${pascalName}NodeData}
            updateData={updateData}
            nodes={contextNodes}
          />
        );`
  );

  // 5. Update Workflow.ts
  log.divider();
  log.step(4, "Updating Workflow.ts");
  const workflowTypesPath = path.join(workflowDir, "types", "Workflow.ts");

  injectIntoFile(
    workflowTypesPath,
    "  // START INJECT HERE",
    `  | "${typeName}"`,
    "after"
  );

  // Inject Config Import
  injectIntoFile(
    workflowTypesPath,
    "// START IMPORT HERE",
    `import { ${pascalName}NodeConfig } from "../nodes/${folderName}/sheet";`,
    "after"
  );

  injectIntoFile(
    workflowTypesPath,
    "// END INJECT NODE DATA HERE", // First occurrence (line ~82)
    `export interface ${pascalName}NodeData extends ${pascalName}NodeConfig, BaseNodeData {}`
  );

  // Inject into WorkflowNodeData union
  injectIntoFile(
    workflowTypesPath,
    "// START INJECT DATA UNION HERE",
    `  | ${pascalName}NodeData`,
    "before"
  );

  // 6. Update Sidebar.tsx
  log.divider();
  log.step(5, "Updating Sidebar.tsx");
  const sidebarPath = path.join(workflowDir, "ui", "components", "Sidebar.tsx");

  try {
    let sidebarContent = fs.readFileSync(sidebarPath, "utf-8");
    // We need to find the category object and inject into its nodes array.
    // Pattern: category: "CategoryName", nodes: [

    // Regex explanation:
    // category: "Triggers"\s*,\s*nodes:\s*\[
    // We want to append to the start of the array or end.

    const categoryName = category; // already validated
    const regex = new RegExp(
      `(category:\\s*"${categoryName}"\\s*,\\s*nodes:\\s*\\[)`
    );

    if (regex.test(sidebarContent)) {
      const replacement = `$1\n      { type: "${typeName}", label: "${rawNodeName}", icon: Code2 },`;
      sidebarContent = sidebarContent.replace(regex, replacement);
      fs.writeFileSync(sidebarPath, sidebarContent);
      log.success(`Added node to ${category} category in Sidebar.tsx`);
    } else {
      log.error(`Could not find category "${category}" in Sidebar.tsx`);
    }
  } catch (e) {
    log.error("Failed to update Sidebar.tsx: " + e);
  }

  log.done();
  rl.close();
}

main().catch((err) => {
  log.error(err.message);
  rl.close();
  process.exit(1);
});
