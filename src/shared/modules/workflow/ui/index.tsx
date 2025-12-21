import React from "react";
import { WorkflowProvider } from "./context/WorkflowContext";
import { Sidebar } from "./components/Sidebar";
import { WorkflowCanvas } from "./components/WorkflowCanvas";
import { NodePropertiesSheet } from "./components/NodePropertiesSheet";

export const WorkflowEditorPage: React.FC = () => {
  return (
    <WorkflowProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 h-full relative">
          <WorkflowCanvas />
          <NodePropertiesSheet />
        </div>
      </div>
    </WorkflowProvider>
  );
};

export default WorkflowEditorPage;
