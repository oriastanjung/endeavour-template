// src/shared/modules/workflow/ui/config/initialNodes.ts
// Default nodes for a new workflow

import type { Node } from "@xyflow/react";

export const initialNodes: Node[] = [
  {
    id: "trigger-1",
    type: "manual.trigger",
    position: { x: 100, y: 200 },
    data: {
      label: "Start",
      type: "manual.trigger",
      config: {},
    },
  },
];
