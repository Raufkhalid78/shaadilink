import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FlowData, initialFlowData } from './flow-types';

interface FlowState {
  flowData: FlowData;
  setFlowData: (updater: Partial<FlowData> | ((prev: FlowData) => Partial<FlowData>)) => void;
  resetFlowData: () => void;
}

export const useFlowStore = create<FlowState>()(
  persist(
    (set) => ({
      flowData: initialFlowData,
      setFlowData: (updater) =>
        set((state) => {
          const updates = typeof updater === 'function' ? updater(state.flowData) : updater;
          return { flowData: { ...state.flowData, ...updates } };
        }),
      resetFlowData: () => set({ flowData: initialFlowData }),
    }),
    {
      name: 'shaadilink_pending_flow_data',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
