"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Terminal,
  FileCode,
  Database,
  Shield,
  Workflow,
  Bot,
  CheckCircle2,
} from "lucide-react";

export function Documentation() {
  return (
    <section id="documentation" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            Documentation
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Comprehensive Guides
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know to get started and build amazing
            applications.
          </p>
        </div>

        <Tabs defaultValue="getting-started" className="w-full">
          <TabsList className="w-full justify-start flex-wrap h-auto gap-2 bg-transparent p-0 mb-8">
            <TabsTrigger
              value="getting-started"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Terminal className="h-4 w-4 mr-2" />
              Getting Started
            </TabsTrigger>
            <TabsTrigger
              value="architecture"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileCode className="h-4 w-4 mr-2" />
              Architecture
            </TabsTrigger>
            <TabsTrigger
              value="authentication"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Shield className="h-4 w-4 mr-2" />
              Authentication
            </TabsTrigger>
            <TabsTrigger
              value="modules"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Database className="h-4 w-4 mr-2" />
              Module Generator
            </TabsTrigger>
            <TabsTrigger
              value="workflow"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Workflow className="h-4 w-4 mr-2" />
              Workflow Engine
            </TabsTrigger>
            <TabsTrigger
              value="llm"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Bot className="h-4 w-4 mr-2" />
              LLM SDK
            </TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started">
            <GettingStartedContent />
          </TabsContent>

          <TabsContent value="architecture">
            <ArchitectureContent />
          </TabsContent>

          <TabsContent value="authentication">
            <AuthenticationContent />
          </TabsContent>

          <TabsContent value="modules">
            <ModuleGeneratorContent />
          </TabsContent>

          <TabsContent value="workflow">
            <WorkflowContent />
          </TabsContent>

          <TabsContent value="llm">
            <LLMContent />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function GettingStartedContent() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            Quick Start
          </CardTitle>
          <CardDescription>Get up and running in minutes</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              <CodeBlock title="1. Clone the repository">
                {`git clone https://github.com/oriastanjung/endeavour-template.git
cd endeavour-template`}
              </CodeBlock>
              <CodeBlock title="2. Install dependencies">
                {`bun install`}
              </CodeBlock>
              <CodeBlock title="3. Setup environment">
                {`cp .env.example .env
# Edit .env with your database credentials`}
              </CodeBlock>
              <CodeBlock title="4. Run database migrations">
                {`bun run prisma:push
bun run prisma:generate`}
              </CodeBlock>
              <CodeBlock title="5. Start development server">
                {`bun run dev`}
              </CodeBlock>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>Required configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <CodeBlock title=".env">
              {`# Database
DATABASE_URL="postgresql://user:password@localhost:5432/endeavour"

# Authentication
JWT_SECRET="your-super-secret-key"

# Redis (BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379

# LLM APIs (Optional)
OPENAI_API_KEY="sk-..."
GEMINI_API_KEY="AIza..."`}
            </CodeBlock>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function ArchitectureContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Structure</CardTitle>
        <CardDescription>
          Clean separation of concerns with modular architecture
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
            {`src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth layout group
│   ├── (homepage)/        # Main layout group
│   └── api/
│       └── trpc/          # tRPC API handler
│
├── backend/               # Backend modules
│   ├── _app.ts           # tRPC router aggregation
│   ├── context.ts        # tRPC context with session
│   ├── containers/       # Dependency injection
│   ├── trpc/             # tRPC initialization
│   └── modules/
│       ├── shared/       # Shared modules (auth, bullmq)
│       └── v1/           # API version 1
│
├── shared/               # Shared utilities
│   ├── modules/
│   │   └── workflow/     # Workflow Engine
│   ├── llm/              # LLM SDKs (OpenAI, Gemini)
│   └── database/         # Prisma client
│
├── components/           # React components
│   └── ui/              # Shadcn/UI components
│
└── modules/             # Frontend page modules`}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function AuthenticationContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Session-Based Architecture
          </CardTitle>
          <CardDescription>
            Secure, database-backed sessions with HTTP-only cookies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-muted rounded-lg">
              <div className="font-medium mb-2">1. Sign In</div>
              <p className="text-sm text-muted-foreground">
                Creates session in database → Stores session_id in HTTP-only
                cookie
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="font-medium mb-2">2. Every Request</div>
              <p className="text-sm text-muted-foreground">
                Context reads session_id → Validates against database → Injects
                user
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="font-medium mb-2">3. Session Expiry</div>
              <p className="text-sm text-muted-foreground">
                7-day expiry → User must re-authenticate
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>RBAC Usage</CardTitle>
          <CardDescription>Role-Based Access Control examples</CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock title="Using RBAC in tRPC">
            {`// Using helper function
authorizeRoles(ctx.user, ["admin", "moderator"]);

// Using pre-built procedures
adminProcedure.query(async ({ ctx }) => { ... });
protectedProcedure.mutation(async ({ ctx }) => { ... });

// Using dynamic role procedure
withRoles(["admin", "editor"]).query(async ({ ctx }) => { ... });`}
          </CodeBlock>
        </CardContent>
      </Card>
    </div>
  );
}

function ModuleGeneratorContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Generate CRUD Modules
          </CardTitle>
          <CardDescription>
            Scaffold complete modules in seconds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CodeBlock title="Run the generator">
            {`bun run module:create`}
          </CodeBlock>

          <div className="mt-6">
            <h4 className="font-medium mb-3">Generated Files</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { file: "Product.entity.ts", desc: "Zod schemas & types" },
                { file: "Product.repository.ts", desc: "Database operations" },
                { file: "Product.service.ts", desc: "Business logic" },
                { file: "Product.route.ts", desc: "tRPC endpoints" },
              ].map((item) => (
                <div
                  key={item.file}
                  className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <div>
                    <code className="text-sm font-mono">{item.file}</code>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function WorkflowContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-primary" />
            Workflow Engine
          </CardTitle>
          <CardDescription>
            Visual automation with drag-and-drop canvas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="nodes">
              <AccordionTrigger>Node Types</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    "Manual Trigger",
                    "Cron Trigger",
                    "Webhook Trigger",
                    "HTTP Request",
                    "Condition",
                    "Switch",
                    "Merge",
                    "Wait",
                    "Set",
                    "Edit Fields",
                    "Item Lists",
                    "Code",
                    "Output",
                  ].map((node) => (
                    <Badge
                      key={node}
                      variant="outline"
                      className="justify-center"
                    >
                      {node}
                    </Badge>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="create">
              <AccordionTrigger>Create New Node</AccordionTrigger>
              <AccordionContent>
                <CodeBlock title="Generate a new node">
                  {`bun run node:create

# Follow prompts:
# ? Enter node name: Slack
# ? Enter node category: Actions

# Creates:
# nodes/slack-node/action/index.ts
# nodes/slack-node/sheet/index.ts
# nodes/slack-node/ui/form.tsx
# nodes/slack-node/ui/index.tsx`}
                </CodeBlock>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="templating">
              <AccordionTrigger>Handlebars Templating</AccordionTrigger>
              <AccordionContent>
                <CodeBlock title="Template examples">
                  {`// Access previous node outputs
"{{nodes.http-request-123.output.data}}"

// Access execution state
"{{state.userId}}"

// Conditionals
"{{#if nodes.condition-1.output}}Yes{{else}}No{{/if}}"`}
                </CodeBlock>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

function LLMContent() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            OpenAI SDK
          </CardTitle>
          <CardDescription>Full-featured OpenAI integration</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <CodeBlock title="Usage example">
              {`import { openaiService } from "@/shared/llm/openai";
import { z } from "zod";

const schema = z.object({
  name: z.string(),
  age: z.number().nullable().optional(),
});

const { output, tokens } = await openaiService.callLLM(
  "Who is Joko Widodo?",
  {
    zodSchema: schema,
    useWebSearch: true,
  }
);

console.log(output.name); // "Joko Widodo"`}
            </CodeBlock>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-500" />
            Gemini SDK
          </CardTitle>
          <CardDescription>
            Google Gemini integration with tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <CodeBlock title="Usage example">
              {`import { geminiService } from "@/shared/llm/gemini";

const { output, tokens } = await geminiService.callLLM(
  "Latest news about Indonesia?",
  {
    useTools: true, // Google Search + URL Context
    zodSchema: schema,
  }
);

// ⚠️ Warning: useTools + zodSchema = 2 API calls
// (Gemini limitation - double cost)`}
            </CodeBlock>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function CodeBlock({ title, children }: { title?: string; children: string }) {
  return (
    <div className="space-y-1.5">
      {title && <p className="text-sm text-muted-foreground">{title}</p>}
      <pre className="text-sm bg-zinc-950 text-zinc-50 p-4 rounded-lg overflow-x-auto">
        <code>{children}</code>
      </pre>
    </div>
  );
}
