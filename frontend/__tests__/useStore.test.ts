import { useStore } from '@/store/useStore'

describe('useStore', () => {
  beforeEach(() => {
    useStore.setState({
      verificationStatus: null,
      stats: null,
      isLoading: false,
    })
  })

  it('initializes with default values', () => {
    const state = useStore.getState()

    expect(state.verificationStatus).toBeNull()
    expect(state.stats).toBeNull()
    expect(state.isLoading).toBe(false)
  })

  it('sets verification status', () => {
    const mockStatus = {
      is_verified: true,
      score: 85,
      last_verified: 1704067200,
      verification_count: 3,
    }

    useStore.getState().setVerificationStatus(mockStatus)

    const state = useStore.getState()
    expect(state.verificationStatus).toEqual(mockStatus)
  })

  it('sets stats', () => {
    const mockStats = {
      total_verifications: 1500,
      human_rate: 0.85,
      average_score: 72.5,
      threshold: 70,
    }

    useStore.getState().setStats(mockStats)

    const state = useStore.getState()
    expect(state.stats).toEqual(mockStats)
  })

  it('sets loading state', () => {
    useStore.getState().setLoading(true)

    const state = useStore.getState()
    expect(state.isLoading).toBe(true)

    useStore.getState().setLoading(false)

    expect(useStore.getState().isLoading).toBe(false)
  })

  it('updates multiple states independently', () => {
    const mockStatus = { is_verified: true, score: 85, last_verified: 0, verification_count: 1 }
    const mockStats = { total_verifications: 100, human_rate: 0.9, average_score: 80, threshold: 70 }

    useStore.getState().setVerificationStatus(mockStatus)
    useStore.getState().setStats(mockStats)
    useStore.getState().setLoading(true)

    const state = useStore.getState()
    expect(state.verificationStatus).toEqual(mockStatus)
    expect(state.stats).toEqual(mockStats)
    expect(state.isLoading).toBe(true)
  })
})