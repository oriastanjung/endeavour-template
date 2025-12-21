// src/shared/modules/workflow/backend/engine/templating.ts
// Handlebars-based templating engine with safe helpers

import Handlebars from "handlebars";

// Create isolated Handlebars instance
const hbs = Handlebars.create();

// Helper: JSON stringify
hbs.registerHelper("json", function (context: unknown) {
  return JSON.stringify(context, null, 2);
});

// Helper: Safe path access (e.g., "nodes.nodeId.output.foo")
hbs.registerHelper("path", function (pathStr: string, context: unknown) {
  if (typeof pathStr !== "string") return undefined;
  const parts = pathStr.split(".");
  let current: unknown = context;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (
      typeof current === "object" &&
      part in (current as Record<string, unknown>)
    ) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }
  return current;
});

// Helper: Equality check
hbs.registerHelper("eq", function (a: unknown, b: unknown) {
  return a === b;
});

// Helper: Not
hbs.registerHelper("not", function (a: unknown) {
  return !a;
});

// Helper: And
hbs.registerHelper("and", function (a: unknown, b: unknown) {
  return a && b;
});

// Helper: Or
hbs.registerHelper("or", function (a: unknown, b: unknown) {
  return a || b;
});

// Helper: Greater than
hbs.registerHelper("gt", function (a: number, b: number) {
  return a > b;
});

// Helper: Less than
hbs.registerHelper("lt", function (a: number, b: number) {
  return a < b;
});

// Helper: Lowercase
hbs.registerHelper("lowercase", function (str: string) {
  return typeof str === "string" ? str.toLowerCase() : str;
});

// Helper: Uppercase
hbs.registerHelper("uppercase", function (str: string) {
  return typeof str === "string" ? str.toUpperCase() : str;
});

// Helper: Trim
hbs.registerHelper("trim", function (str: string) {
  return typeof str === "string" ? str.trim() : str;
});

export type TemplateContext = {
  state: Record<string, unknown>;
  nodes: Record<
    string,
    {
      input?: unknown;
      output?: unknown;
    }
  >;
};

/**
 * Creates a render function with the given context
 */
export function createRenderer(context: TemplateContext) {
  return function render(
    template: string,
    additionalScope?: Record<string, unknown>
  ): string {
    try {
      const compiled = hbs.compile(template, { strict: false });
      const fullContext = {
        ...context,
        ...additionalScope,
      };
      return compiled(fullContext);
    } catch (error) {
      console.error("[Templating] Render error:", error);
      return template; // Return original on error
    }
  };
}

/**
 * Compile and render a template string
 */
export function renderTemplate(
  template: string,
  context: TemplateContext
): string {
  return createRenderer(context)(template);
}

export { hbs };
