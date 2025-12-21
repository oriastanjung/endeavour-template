import React, {
  createContext,
  useContext,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  type OnNodesChange,
  type OnEdgesChange,
  ReactFlowProvider,
} from "@xyflow/react";
import { initialNodes } from "../config/initialNodes";
import { initialEdges } from "../config/initialEdges";
import type { WorkflowNode } from "../../types/Workflow";

interface WorkflowContextType {
  nodes: WorkflowNode[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  setNodes: React.Dispatch<React.SetStateAction<WorkflowNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(
  undefined
);

export const useWorkflowContext = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error(
      "useWorkflowContext must be used within a WorkflowProvider"
    );
  }
  return context;
};

interface WorkflowProviderProps {
  children: ReactNode;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onChanges?: (nodes: Node[], edges: Edge[]) => void;
}

export const WorkflowProvider: React.FC<WorkflowProviderProps> = ({
  children,
  initialNodes: propInitialNodes,
  initialEdges: propInitialEdges,
  onChanges,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    (propInitialNodes || initialNodes) as Node[]
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    (propInitialEdges || initialEdges) as Edge[]
  );

  // Track if this is the first render to avoid calling onChanges on mount
  const isFirstRender = useRef(true);

  // Call onChanges when nodes or edges change (skip first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (onChanges) {
      onChanges(nodes, edges);
    }
  }, [nodes, edges, onChanges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <ReactFlowProvider>
      <WorkflowContext.Provider
        value={{
          nodes: nodes as WorkflowNode[],
          edges,
          onNodesChange,
          onEdgesChange,
          onConnect,
          setNodes: setNodes as React.Dispatch<
            React.SetStateAction<WorkflowNode[]>
          >,
          setEdges,
        }}
      >
        {children}
      </WorkflowContext.Provider>
    </ReactFlowProvider>
  );
};
