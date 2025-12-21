# 🔄 Cara Kerja Workflow Automation System

## Daftar Isi
- [Gambaran Umum](#gambaran-umum)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Alur Eksekusi Workflow](#alur-eksekusi-workflow)
- [Komponen Utama](#komponen-utama)
- [State Management](#state-management)
- [Real-time Updates](#real-time-updates)

---

## Gambaran Umum

Workflow Automation System adalah sistem yang memungkinkan kamu membuat dan menjalankan **alur kerja otomatis** dengan cara visual (drag-and-drop). Sistem ini mirip dengan n8n, Zapier, atau Make.com.

### Konsep Dasar

```
┌─────────────────────────────────────────────────────────────┐
│                        WORKFLOW                              │
│                                                              │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐           │
│   │  Manual  │────▶│   HTTP   │────▶│  Output  │           │
│   │ Trigger  │     │ Request  │     │   Node   │           │
│   └──────────┘     └──────────┘     └──────────┘           │
│                                                              │
│   Node 1           Node 2           Node 3                  │
│   (Trigger)        (Action)         (Action)                │
└─────────────────────────────────────────────────────────────┘
```

**Workflow** = Kumpulan **Node** yang terhubung dengan **Edge** (garis penghubung)

---

## Arsitektur Sistem

### Tech Stack

| Layer | Teknologi | Fungsi |
|-------|-----------|--------|
| Frontend | Next.js + React Flow | UI editor visual |
| Backend | tRPC + Prisma | API + Database |
| Queue | BullMQ + Redis | Antrian eksekusi async |
| Workers | Node.js Workers | Eksekusi node |

### Struktur Folder

```
src/shared/modules/workflow/
├── backend/           # 🔧 Logic server-side
│   ├── engine/        # Templating & DAG utilities
│   ├── services/      # Business logic (CRUD, execution)
│   ├── queue/         # BullMQ queues
│   ├── workers/       # Worker processors
│   └── trpc/          # API endpoints
│
├── nodes/             # 📦 Definisi setiap node
│   ├── manual-trigger-node/
│   ├── cron-trigger-node/
│   ├── condition-node/
│   ├── http-request-node/
│   └── output-node/
│
├── ui/                # 🎨 Komponen React
│   ├── components/    # Reusable components
│   ├── pages/         # Page components
│   ├── context/       # React context
│   └── config/        # Initial configs
│
├── config/            # ⚙️ Registry & types
├── types/             # 📝 TypeScript types
└── prisma/            # 🗃️ Database schema
```

---

## Alur Eksekusi Workflow

### Step-by-Step Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  1. USER TRIGGER                                                 │
│     User klik "Run Workflow" atau cron trigger berjalan          │
│                              │                                   │
│                              ▼                                   │
│  2. CREATE EXECUTION                                             │
│     Sistem membuat record di tabel WorkflowExecution             │
│     Status: PENDING                                              │
│                              │                                   │
│                              ▼                                   │
│  3. ENQUEUE START NODES                                          │
│     Start nodes (trigger) dimasukkan ke BullMQ queue             │
│                              │                                   │
│                              ▼                                   │
│  4. WORKER PROCESS NODE                                          │
│     Worker mengambil job, menjalankan node action                │
│     Menyimpan output ke WorkflowNodeRun                          │
│                              │                                   │
│                              ▼                                   │
│  5. PROPAGATE STATE                                              │
│     State dari node saat ini diteruskan ke node berikutnya       │
│                              │                                   │
│                              ▼                                   │
│  6. ENQUEUE NEXT NODES                                           │
│     Node berikutnya dimasukkan ke queue                          │
│     (Kembali ke step 4 sampai semua node selesai)                │
│                              │                                   │
│                              ▼                                   │
│  7. EXECUTION COMPLETE                                           │
│     Status diupdate: SUCCESS / FAILED                            │
└─────────────────────────────────────────────────────────────────┘
```

### Contoh Real-World

Misalkan kamu punya workflow:
```
Manual Trigger → HTTP Request → Output
```

1. User klik "Run Workflow"
2. Sistem buat `WorkflowExecution` dengan status `PENDING`
3. `Manual Trigger` dimasukkan ke queue
4. Worker jalankan `Manual Trigger`:
   - Output: `{ "triggered": true, "timestamp": "2024-..." }`
   - Status node: `SUCCESS`
5. State diteruskan ke `HTTP Request`
6. Worker jalankan `HTTP Request`:
   - Ambil URL dari config
   - Gunakan state sebagai placeholder
   - Output: `{ "response": { ... } }`
7. State diteruskan ke `Output`
8. Worker jalankan `Output`:
   - Log semua state
   - Selesai!
9. Execution status: `SUCCESS`

---

## Komponen Utama

### 1. Node

Node adalah unit terkecil dalam workflow. Setiap node punya 3 bagian:

| Bagian | File | Fungsi |
|--------|------|--------|
| **Schema** | `sheet/index.ts` | Validasi config dengan Zod |
| **Action** | `action/index.ts` | Logic yang dijalankan |
| **UI** | `ui/index.tsx` | Tampilan di canvas |

```typescript
// Contoh action node
export const myNodeAction: NodeAction = async (ctx) => {
  const { config, stateIn } = ctx;
  
  // Lakukan sesuatu...
  const result = await doSomething(config);
  
  return {
    stateOut: { ...stateIn, result },  // State untuk node berikutnya
    edgeLabel: "success",               // Edge mana yang diambil (optional)
  };
};
```

### 2. Edge

Edge adalah garis penghubung antar node. Edge bisa punya **label** untuk conditional branching:

```
                    ┌──────────┐
                    │  Output  │
                    │   TRUE   │
                    └──────────┘
                         ▲
                         │ label: "true"
                         │
┌──────────┐     ┌──────────────┐
│ Trigger  │────▶│  Condition   │
└──────────┘     └──────────────┘
                         │
                         │ label: "false"
                         ▼
                    ┌──────────┐
                    │  Output  │
                    │  FALSE   │
                    └──────────┘
```

### 3. Execution

Satu kali menjalankan workflow = satu **Execution**. Setiap execution menyimpan:

- `id` - ID unik
- `workflowId` - Workflow mana yang dijalankan
- `status` - PENDING / RUNNING / SUCCESS / FAILED / CANCELED
- `stateIn` - Input awal
- `stateOut` - Output akhir
- `nodeRuns[]` - Detail tiap node yang dijalankan

### 4. NodeRun

Detail eksekusi satu node dalam satu execution:

- `nodeId` - Node mana
- `executionId` - Execution mana
- `status` - PENDING / RUNNING / SUCCESS / FAILED / SKIPPED
- `stateIn` - Input node ini
- `stateOut` - Output node ini
- `error` - Error message jika gagal

---

## State Management

### Konsep State

**State** adalah data yang mengalir dari node ke node. Seperti air yang mengalir di pipa:

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Node A  │────▶│  Node B  │────▶│  Node C  │
│          │     │          │     │          │
│ stateOut │────▶│ stateIn  │     │          │
│   {...}  │     │   {...}  │────▶│ stateIn  │
└──────────┘     └──────────┘     │   {...}  │
                                  └──────────┘
```

### State Merge

Jika satu node menerima input dari **multiple nodes**, state akan di-merge:

```typescript
// Node A output: { name: "John" }
// Node B output: { age: 30 }

// Node C menerima:
{
  name: "John",
  age: 30
}
```

### Templating

Di dalam config node, kamu bisa menggunakan **Handlebars template** untuk mengakses state:

```handlebars
URL: https://api.example.com/users/{{userId}}
Body: { "name": "{{name}}", "email": "{{email}}" }
```

Helper yang tersedia:
- `{{json data}}` - Convert ke JSON string
- `{{get object "path.to.value"}}` - Akses nested value
- `{{#eq a b}}equal{{/eq}}` - Kondisional

---

## Real-time Updates

### Event System

Sistem menggunakan **EventEmitter** untuk real-time updates:

```typescript
// Backend emit event
executionEvents.emit("node:run:complete", {
  executionId: "...",
  nodeId: "...",
  status: "SUCCESS"
});

// Frontend listen via tRPC subscription
trpc.workflow.onExecutionUpdate.useSubscription({
  executionId: "..."
});
```

### Events yang tersedia

| Event | Kapan di-emit |
|-------|---------------|
| `execution:start` | Execution dimulai |
| `execution:complete` | Execution selesai |
| `node:run:start` | Node mulai diproses |
| `node:run:complete` | Node selesai diproses |

---

## Database Schema (Simplified)

```prisma
model Workflow {
  id          String           @id
  name        String
  isActive    Boolean          @default(false)
  nodes       WorkflowNode[]
  edges       WorkflowEdge[]
  executions  WorkflowExecution[]
}

model WorkflowNode {
  id         String    @id
  type       String    // "manual.trigger", "http.request", etc
  config     Json      // Node-specific configuration
  positionX  Float
  positionY  Float
}

model WorkflowEdge {
  id           String  @id
  sourceNodeId String
  targetNodeId String
  label        String? // For conditional branching
}

model WorkflowExecution {
  id        String          @id
  status    ExecutionStatus
  stateIn   Json?
  stateOut  Json?
  nodeRuns  WorkflowNodeRun[]
}

model WorkflowNodeRun {
  id        String     @id
  nodeId    String
  status    NodeRunStatus
  stateIn   Json?
  stateOut  Json?
  error     Json?
}
```

---

## Tips & Best Practices

### ✅ Do's

1. **Gunakan trigger sebagai node pertama** - Setiap workflow harus dimulai dengan trigger node
2. **Simpan state seminimal mungkin** - Jangan pass data yang tidak perlu
3. **Handle errors** - Gunakan try-catch di action node
4. **Test node secara terpisah** - Pastikan setiap node bekerja sebelum connect

### ❌ Don'ts

1. **Jangan buat cycle** - Workflow harus berupa DAG (Directed Acyclic Graph)
2. **Jangan hardcode secrets** - Gunakan environment variables
3. **Jangan blocking terlalu lama** - Node punya timeout, gunakan async

---

## Troubleshooting

### Workflow tidak jalan

1. Cek apakah Redis running
2. Cek apakah workers running
3. Lihat Bull Board di `/bull-board`

### Node stuck di PENDING

1. Cek queue di Bull Board
2. Pastikan worker tidak crash
3. Cek logs di terminal

### State tidak terpassing

1. Pastikan node sebelumnya return `stateOut`
2. Cek edge connection di database
3. Verify dengan console.log di action

---

**Next Steps:**
- [Cara Setup Workflow →](./HOW-TO-SETUP.md)
- [Cara Menambah Node Baru →](./HOW-TO-ADD-NODE.md)
