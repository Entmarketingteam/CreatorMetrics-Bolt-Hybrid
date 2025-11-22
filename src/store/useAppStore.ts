import { create } from 'zustand'

interface AppState {
  user: {
    id: string
    name: string
  } | null
  setUser: (user: AppState['user']) => void
  clearUser: () => void
}

// Example Zustand store for global state management
export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}))
