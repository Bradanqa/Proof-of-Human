import { fetchChallenge, submitVerification, fetchStatus, fetchStats } from '@/utils/api'

global.fetch = jest.fn()

describe('API Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('fetchChallenge', () => {
    it('fetches challenge successfully', async () => {
      const mockChallenge = {
        challenge_id: 'challenge_123',
        challenge_type: 'behavioral',
        instructions: 'Complete tasks',
        expires_at: Date.now() + 300000,
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockChallenge,
      })

      const result = await fetchChallenge('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/challenge'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      )
      expect(result).toEqual(mockChallenge)
    })

    it('handles fetch error', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      await expect(
        fetchChallenge('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU')
      ).rejects.toThrow('Network error')
    })
  })

  describe('submitVerification', () => {
    it('submits verification successfully', async () => {
      const mockResponse = {
        success: true,
        score: 85,
        is_human: true,
        message: 'Human verified',
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockResponse,
      })

      const payload = {
        wallet_address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        telemetry: {
          mouse_movements: [[100, 200]],
          click_timestamps: [1000, 2000],
          typing_events: [],
          browser_fingerprint: {},
          challenge_id: 'challenge_123',
        },
      }

      const result = await submitVerification(payload)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/verify'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload),
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('handles verification failure', async () => {
      const mockResponse = {
        success: false,
        score: 30,
        is_human: false,
        message: 'Score below threshold',
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockResponse,
      })

      const payload = {
        wallet_address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        telemetry: {},
      }

      const result = await submitVerification(payload)

      expect(result.success).toBe(false)
      expect(result.is_human).toBe(false)
    })
  })

  describe('fetchStatus', () => {
    it('fetches status successfully', async () => {
      const mockStatus = {
        wallet_address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
        is_verified: true,
        score: 85,
        last_verified: 1704067200,
        verification_count: 3,
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockStatus,
      })

      const result = await fetchStatus('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/status/')
      )
      expect(result).toEqual(mockStatus)
    })

    it('handles status fetch error', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      await expect(
        fetchStatus('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU')
      ).rejects.toThrow('Network error')
    })
  })

  describe('fetchStats', () => {
    it('fetches stats successfully', async () => {
      const mockStats = {
        total_verifications: 1500,
        human_rate: 0.85,
        average_score: 72.5,
        threshold: 70,
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockStats,
      })

      const result = await fetchStats()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/stats')
      )
      expect(result).toEqual(mockStats)
    })

    it('handles stats fetch error', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      await expect(fetchStats()).rejects.toThrow('Network error')
    })
  })
})