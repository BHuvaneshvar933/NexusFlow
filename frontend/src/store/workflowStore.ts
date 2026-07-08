import { create } from 'zustand';

export interface ActionConfig {
  id: string;
  actionType: string;
  config: Record<string, any>;
  sequence: number;
}

interface WorkflowState {
  id?: string;
  name: string;
  description: string;
  triggerType: string;
  cronExpression?: string;
  testPayload?: string;
  actions: ActionConfig[];
  setId: (id: string) => void;
  setName: (name: string) => void;
  setDescription: (desc: string) => void;
  setTriggerType: (type: string) => void;
  setCronExpression: (expr: string) => void;
  setTestPayload: (payload: string) => void;
  addAction: (type: string) => void;
  removeAction: (id: string) => void;
  updateActionConfig: (id: string, config: Record<string, any>) => void;
  reorderActions: (startIndex: number, endIndex: number) => void;
  loadWorkflow: (workflow: any) => void;
  reset: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  name: 'Untitled Workflow',
  description: '',
  triggerType: 'MANUAL', // Default trigger
  actions: [],

  setId: (id) => set({ id }),
  setName: (name) => set({ name }),
  setDescription: (description) => set({ description }),
  setTriggerType: (triggerType) => set({ triggerType }),
  setCronExpression: (cronExpression) => set({ cronExpression }),
  setTestPayload: (testPayload) => set({ testPayload }),

  addAction: (type) => set((state) => {
    const newAction: ActionConfig = {
      id: crypto.randomUUID(),
      actionType: type,
      config: {},
      sequence: state.actions.length,
    };
    return { actions: [...state.actions, newAction] };
  }),

  removeAction: (id) => set((state) => {
    const filtered = state.actions.filter((a) => a.id !== id);
    // Update sequence numbers
    const updated = filtered.map((a, index) => ({ ...a, sequence: index }));
    return { actions: updated };
  }),

  updateActionConfig: (id, config) => set((state) => ({
    actions: state.actions.map((a) => (a.id === id ? { ...a, config } : a)),
  })),

  reorderActions: (startIndex, endIndex) => set((state) => {
    const result = Array.from(state.actions);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    // Update sequences
    const updated = result.map((a, index) => ({ ...a, sequence: index }));
    return { actions: updated };
  }),

  loadWorkflow: (workflow) => set({
    id: workflow.id,
    name: workflow.name,
    description: workflow.description || '',
    triggerType: workflow.triggerType,
    cronExpression: workflow.cronExpression || undefined,
    testPayload: workflow.testPayload || undefined,
    actions: workflow.actions || [],
  }),

  reset: () => set({
    id: undefined,
    name: 'Untitled Workflow',
    description: '',
    triggerType: 'MANUAL',
    cronExpression: undefined,
    testPayload: undefined,
    actions: [],
  }),
}));
