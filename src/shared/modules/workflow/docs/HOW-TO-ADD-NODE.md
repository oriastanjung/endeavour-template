# 🔌 Cara Menambah Node Baru

## Daftar Isi
- [Struktur Node](#struktur-node)
- [Langkah-langkah](#langkah-langkah)
- [Contoh: Membuat Slack Node](#contoh-membuat-slack-node)
- [Testing Node](#testing-node)
- [Tips & Best Practices](#tips--best-practices)

---

## Struktur Node

Setiap node terdiri dari **3 bagian utama**:

```
src/shared/modules/workflow/nodes/
└── [nama-node]/
    ├── sheet/
    │   └── index.ts      # 📋 Schema (Zod validation)
    ├── action/
    │   └── index.ts      # ⚡ Logic (Backend execution)
    └── ui/
        └── index.tsx     # 🎨 Component (Frontend display)
```

### Penjelasan Setiap Bagian

| Bagian | File | Fungsi |
|--------|------|--------|
| **Schema** | `sheet/index.ts` | Mendefinisikan config node dengan Zod schema |
| **Action** | `action/index.ts` | Logic yang dijalankan saat node dieksekusi |
| **UI** | `ui/index.tsx` | Komponen React untuk tampilan di canvas |

---

## Langkah-langkah

### Step 1: Buat Folder Node

```bash
mkdir -p src/shared/modules/workflow/nodes/my-new-node/{sheet,action,ui}
```

### Step 2: Buat Schema

File: `sheet/index.ts`

```typescript
import { z } from "zod";

// 1. Definisikan schema dengan Zod
export const myNewNodeSchema = z.object({
  // Config yang bisa diisi user di UI
  apiKey: z.string().min(1, "API Key is required"),
  endpoint: z.string().url("Must be a valid URL"),
  timeout: z.number().optional().default(30000),
});

// 2. Export type untuk TypeScript
export type MyNewNodeConfig = z.infer<typeof myNewNodeSchema>;
```

> **💡 Tips:** Gunakan `.optional().default()` untuk field yang tidak wajib

### Step 3: Buat Action

File: `action/index.ts`

```typescript
import type { NodeAction } from "@/shared/modules/workflow/backend/types";
import { renderTemplate } from "@/shared/modules/workflow/backend/engine";

export const myNewNodeAction: NodeAction = async (ctx) => {
  // 1. Destructure context
  const { config, stateIn, nodeId, executionId } = ctx;

  try {
    // 2. Render template jika ada placeholder
    const endpoint = renderTemplate(config.endpoint, stateIn);
    
    // 3. Lakukan logic utama
    const response = await fetch(endpoint, {
      headers: {
        "Authorization": `Bearer ${config.apiKey}`,
      },
    });
    
    const data = await response.json();
    
    // 4. Return state untuk node berikutnya
    return {
      stateOut: {
        ...stateIn,           // Preserve state sebelumnya
        myNodeResult: data,   // Tambah hasil node ini
      },
      output: data,           // Output untuk logging
      edgeLabel: undefined,   // Optional: untuk conditional routing
    };
    
  } catch (error) {
    // 5. Handle error
    return {
      stateOut: stateIn,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
```

### Step 4: Buat UI Component

File: `ui/index.tsx`

```tsx
"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Zap } from "lucide-react"; // Pilih icon yang sesuai

function MyNewNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 bg-background shadow-sm
        min-w-[150px] transition-all
        ${selected ? "border-primary" : "border-border"}
      `}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-primary"
      />

      {/* Node Content */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded bg-primary/10">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        <div>
          <div className="text-sm font-medium">
            {data.label || "My New Node"}
          </div>
          <div className="text-xs text-muted-foreground">
            Custom Action
          </div>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-primary"
      />
    </div>
  );
}

export default memo(MyNewNode);
```

### Step 5: Register Node

**A. Tambah ke Node Types**

File: `config/nodeTypes.ts`

```typescript
export const nodeTypes = [
  // ... existing nodes
  {
    type: "my-new.node",        // Format: category.name
    label: "My New Node",
    category: "actions",        // "triggers", "actions", "logic"
    icon: "Zap",
  },
];

// Untuk React Flow
export const nodeComponents = {
  // ... existing
  "my-new.node": MyNewNodeComponent,
};
```

**B. Tambah ke Node Registry**

File: `config/nodeRegistry.ts`

```typescript
import { myNewNodeAction } from "../nodes/my-new-node/action";
import { myNewNodeSchema } from "../nodes/my-new-node/sheet";

export const nodeRegistry: Record<string, NodeDefinition> = {
  // ... existing nodes
  
  "my-new.node": {
    type: "my-new.node",
    label: "My New Node",
    schema: myNewNodeSchema,
    action: myNewNodeAction,
  },
};
```

### Step 6: Tambah ke Sidebar (Optional)

Jika ingin node muncul di sidebar drag-and-drop:

File: `ui/components/Sidebar.tsx`

```tsx
const listNodes = [
  // ... existing
  {
    type: "my-new.node",
    label: "My New Node",
    icon: Zap,
    category: "Actions",
  },
];
```

---

## Contoh: Membuat Slack Node

Mari buat node untuk mengirim pesan ke Slack!

### 1. Schema

```typescript
// nodes/slack-message-node/sheet/index.ts
import { z } from "zod";

export const slackMessageSchema = z.object({
  webhookUrl: z.string().url("Must be a valid Slack webhook URL"),
  channel: z.string().optional(),
  message: z.string().min(1, "Message is required"),
  username: z.string().optional().default("Workflow Bot"),
  iconEmoji: z.string().optional().default(":robot_face:"),
});

export type SlackMessageConfig = z.infer<typeof slackMessageSchema>;
```

### 2. Action

```typescript
// nodes/slack-message-node/action/index.ts
import type { NodeAction } from "@/shared/modules/workflow/backend/types";
import { renderTemplate } from "@/shared/modules/workflow/backend/engine";

export const slackMessageAction: NodeAction = async (ctx) => {
  const { config, stateIn } = ctx;

  try {
    // Render template untuk dynamic message
    const message = renderTemplate(config.message, stateIn);

    const payload = {
      text: message,
      username: config.username,
      icon_emoji: config.iconEmoji,
      ...(config.channel && { channel: config.channel }),
    };

    const response = await fetch(config.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }

    return {
      stateOut: {
        ...stateIn,
        slackMessageSent: true,
        slackTimestamp: new Date().toISOString(),
      },
      output: { success: true, message },
    };

  } catch (error) {
    return {
      stateOut: stateIn,
      error: error instanceof Error ? error.message : "Failed to send Slack message",
    };
  }
};
```

### 3. UI

```tsx
// nodes/slack-message-node/ui/index.tsx
"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { MessageSquare } from "lucide-react";

function SlackMessageNode({ data, selected }: NodeProps) {
  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 bg-background shadow-sm
        min-w-[150px] transition-all
        ${selected ? "border-primary" : "border-border"}
      `}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-purple-500"
      />

      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded bg-purple-500/10">
          <MessageSquare className="w-4 h-4 text-purple-500" />
        </div>
        <div>
          <div className="text-sm font-medium">
            {data.label || "Slack Message"}
          </div>
          <div className="text-xs text-muted-foreground">
            Send notification
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-purple-500"
      />
    </div>
  );
}

export default memo(SlackMessageNode);
```

---

## Testing Node

### 1. Unit Test Action

```typescript
// __tests__/nodes/slack-message.test.ts
import { slackMessageAction } from "../nodes/slack-message-node/action";

describe("Slack Message Node", () => {
  it("should send message successfully", async () => {
    const ctx = {
      nodeId: "test-node",
      executionId: "test-exec",
      config: {
        webhookUrl: "https://hooks.slack.com/...",
        message: "Hello {{name}}!",
      },
      stateIn: { name: "World" },
    };

    const result = await slackMessageAction(ctx);
    
    expect(result.stateOut.slackMessageSent).toBe(true);
    expect(result.error).toBeUndefined();
  });
});
```

### 2. Manual Test di UI

1. Buat workflow baru
2. Drag node baru dari sidebar
3. Connect dengan trigger
4. Klik Run
5. Cek execution di preview page

---

## Tips & Best Practices

### ✅ Do's

1. **Gunakan Zod untuk validasi**
   ```typescript
   z.string().url() // Validasi URL
   z.number().min(1).max(100) // Range validation
   ```

2. **Preserve stateIn**
   ```typescript
   return {
     stateOut: { ...stateIn, newData: result }
   };
   ```

3. **Handle errors gracefully**
   ```typescript
   try {
     // logic
   } catch (error) {
     return { stateOut: stateIn, error: error.message };
   }
   ```

4. **Support templating**
   ```typescript
   const url = renderTemplate(config.url, stateIn);
   ```

5. **Gunakan TypeScript types**
   ```typescript
   export type MyConfig = z.infer<typeof mySchema>;
   ```

### ❌ Don'ts

1. **Jangan hardcode credentials**
   ```typescript
   // ❌ Bad
   const apiKey = "sk-xxx";
   
   // ✅ Good
   const apiKey = config.apiKey;
   ```

2. **Jangan blocking terlalu lama**
   ```typescript
   // ❌ Bad - bisa timeout
   await sleep(60000);
   
   // ✅ Good - set timeout
   const controller = new AbortController();
   setTimeout(() => controller.abort(), 30000);
   ```

3. **Jangan mutate stateIn**
   ```typescript
   // ❌ Bad
   stateIn.newField = "value";
   
   // ✅ Good
   return { stateOut: { ...stateIn, newField: "value" } };
   ```

---

## Node Types Reference

| Category | Contoh Node | Icon Suggestion |
|----------|-------------|-----------------|
| **Triggers** | Manual, Cron, Webhook, Event | Play, Clock, Webhook |
| **Actions** | HTTP, Email, Slack, Database | Globe, Mail, MessageSquare, Database |
| **Logic** | Condition, Switch, Loop, Delay | GitBranch, ArrowUpDown, RotateCw, Clock |
| **Transform** | Filter, Map, Merge, Split | Filter, Map, Merge, Split |

---

**Dokumentasi Terkait:**
- [Cara Kerja Workflow ←](./HOW-ITS-WORK.md)
- [Cara Setup Workflow →](./HOW-TO-SETUP.md)
