import type { NodeAction } from "../../../backend/types";
import { ItemListsConfig } from "../sheet";

// Helper to access deep property
const getDeep = (obj: any, path: string) => {
  if (!path) return undefined;
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
};

export const itemListsAction: NodeAction = async (input, ctx) => {
  const config = input as ItemListsConfig;
  const operation = config.operation || "limit";
  const field = config.field;

  // Get the target list
  let list: any[] = [];
  if (field) {
    // Support deep paths e.g. "nodes.step1.output.items"
    // If the field starts with "nodes." it might be referring to ctx.state which has "nodes" if we structured it that way?
    // Wait, ctx.state IS the accumulated state.
    const val = getDeep(ctx.state, field);
    if (Array.isArray(val)) {
      list = val;
    } else {
      await ctx.log("warn", `Item Lists: Field '${field}' is not an array`, {
        val,
      });
    }
  } else if (Array.isArray(ctx.state)) {
    list = ctx.state as any[];
  }

  await ctx.log("info", `Item Lists: ${operation} on ${list.length} items`);

  let result = [...list];

  switch (operation) {
    case "limit":
      if (config.limit !== undefined) {
        result = result.slice(0, config.limit);
      }
      break;
    case "sort":
      if (config.sortKey) {
        result.sort((a, b) => {
          // Sort key is property of item
          const valA = a[config.sortKey!] ?? "";
          const valB = b[config.sortKey!] ?? "";
          if (valA < valB) return config.sortOrder === "desc" ? 1 : -1;
          if (valA > valB) return config.sortOrder === "desc" ? -1 : 1;
          return 0;
        });
      }
      break;
  }

  // Update state with result
  const output: Record<string, unknown> = { ...ctx.state };
  if (field) {
    // We generally don't want to mutate deep state in a "functional" flow,
    // but "Item Lists" usually transforms a list.
    // Modifying deep state is hard without lodash.set
    // For MVP, we'll output it as "items" (new property) OR try to patch if it's top level.
    // If it's deep, maybe we just output it as a new field?
    // Let's output as "items" for consistency/safety unless field is top level.
    if (!field.includes(".")) {
      output[field] = result;
    } else {
      output["items"] = result;
    }
  } else {
    output["items"] = result;
  }

  return {
    output,
    nextEdgeLabel: undefined,
  };
};
