import { create } from "zustand";

export const useCounterStore = create((set) => ({
  count: 0,
  increment1: () => set((state) => ({ count: state.count + 1 })),
  decrement2: () => set((state) => ({ count: state.count - 1 })),
}));
