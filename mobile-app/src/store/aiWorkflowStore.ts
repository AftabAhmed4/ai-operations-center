import { create } from 'zustand';

export type AgentStep = 'intake' | 'insight' | 'decision' | 'execution';

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
}

interface AIWorkflowState {
  workflowId: string | null;
  isProcessing: boolean;
  isAwaitingApproval: boolean;
  currentStep: AgentStep;
  logs: LogEntry[];
  approvalData: any | null; // Data to show in the approval modal
  beforeAfterData: any | null; // Data to show in comparison card after execution

  // Actions
  triggerWorkflow: (id: string) => void;
  addLog: (message: string) => void;
  setStep: (step: AgentStep) => void;
  requireApproval: (data: any) => void;
  approveAction: () => void;
  rejectAction: () => void;
  finishExecution: (beforeAfter: any) => void;
  reset: () => void;
}

export const useAIWorkflowStore = create<AIWorkflowState>((set) => ({
  workflowId: null,
  isProcessing: false,
  isAwaitingApproval: false,
  currentStep: 'intake',
  logs: [],
  approvalData: null,
  beforeAfterData: null,

  triggerWorkflow: (id) =>
    set({
      workflowId: id,
      isProcessing: true,
      isAwaitingApproval: false,
      currentStep: 'intake',
      logs: [{ id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), message: 'Workflow triggered. Initializing Intake Agent...' }],
      approvalData: null,
      beforeAfterData: null,
    }),

  addLog: (message) =>
    set((state) => ({
      logs: [...state.logs, { id: Date.now().toString() + Math.random(), timestamp: new Date().toLocaleTimeString(), message }],
    })),

  setStep: (step) => set({ currentStep: step }),

  requireApproval: (data) =>
    set({
      isAwaitingApproval: true,
      approvalData: data,
    }),

  approveAction: () =>
    set({
      isAwaitingApproval: false,
      currentStep: 'execution',
    }),

  rejectAction: () =>
    set({
      isAwaitingApproval: false,
      isProcessing: false,
      workflowId: null,
      logs: [],
    }),

  finishExecution: (beforeAfter) =>
    set({
      isProcessing: false,
      beforeAfterData: beforeAfter,
      currentStep: 'execution',
    }),

  reset: () =>
    set({
      workflowId: null,
      isProcessing: false,
      isAwaitingApproval: false,
      currentStep: 'intake',
      logs: [],
      approvalData: null,
      beforeAfterData: null,
    }),
}));
