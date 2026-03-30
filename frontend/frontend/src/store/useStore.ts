import { create } from 'zustand'

interface AppState {
  verificationStatus: any | null
  stats: any | null
  isLoading: boolean
  setVerificationStatus: (status: any) => void
  setStats: (stats: any) => void
  setLoading: (loading: boolean) => void
}

export const useStore = create<AppState>((set) => ({
  verificationStatus: null,
  stats: null,
  isLoading: false,
  setVerificationStatus: (status) => set({ verificationStatus: status }),
  setStats: (stats) => set({ stats }),
  setLoading: (loading) => set({ isLoading: loading }),
}))