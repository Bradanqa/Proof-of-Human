describe('Utility Functions', () => {
  describe('formatDate', () => {
    const formatDate = (timestamp: number): string => {
      if (!timestamp) return 'Never'
      return new Date(timestamp * 1000).toLocaleDateString()
    }

    it('formats valid timestamp', () => {
      const result = formatDate(1704067200)
      expect(result).not.toBe('Never')
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
    })

    it('returns Never for zero timestamp', () => {
      const result = formatDate(0)
      expect(result).toBe('Never')
    })

    it('returns Never for null timestamp', () => {
      const result = formatDate(null as unknown as number)
      expect(result).toBe('Never')
    })
  })

  describe('getScoreColor', () => {
    const getScoreColor = (score: number): string => {
      if (score >= 80) return 'text-green-400'
      if (score >= 60) return 'text-yellow-400'
      return 'text-red-400'
    }

    it('returns green for high scores', () => {
      expect(getScoreColor(85)).toBe('text-green-400')
      expect(getScoreColor(100)).toBe('text-green-400')
      expect(getScoreColor(80)).toBe('text-green-400')
    })

    it('returns yellow for medium scores', () => {
      expect(getScoreColor(70)).toBe('text-yellow-400')
      expect(getScoreColor(60)).toBe('text-yellow-400')
    })

    it('returns red for low scores', () => {
      expect(getScoreColor(50)).toBe('text-red-400')
      expect(getScoreColor(0)).toBe('text-red-400')
    })
  })

  describe('validateWalletAddress', () => {
    const validateWalletAddress = (address: string): boolean => {
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
    }

    it('validates correct Solana address', () => {
      const validAddress = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
      expect(validateWalletAddress(validAddress)).toBe(true)
    })

    it('rejects invalid address', () => {
      const invalidAddress = 'invalid_wallet_address'
      expect(validateWalletAddress(invalidAddress)).toBe(false)
    })

    it('rejects empty string', () => {
      expect(validateWalletAddress('')).toBe(false)
    })
  })

  describe('calculateEntropy', () => {
    const calculateEntropy = (values: number[]): number => {
      if (!values || values.length < 2) return 0

      const hist: number[] = []
      const bins = 10
      const min = Math.min(...values)
      const max = Math.max(...values)
      const binSize = (max - min) / bins || 1

      for (let i = 0; i < bins; i++) {
        hist.push(0)
      }

      values.forEach((v) => {
        const bin = Math.min(Math.floor((v - min) / binSize), bins - 1)
        hist[bin]++
      })

      const total = values.length
      let entropy = 0

      hist.forEach((count) => {
        if (count > 0) {
          const p = count / total
          entropy -= p * Math.log2(p)
        }
      })

      return entropy
    }

    it('calculates entropy for varied values', () => {
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const entropy = calculateEntropy(values)
      expect(entropy).toBeGreaterThan(0)
    })

    it('returns zero for empty array', () => {
      expect(calculateEntropy([])).toBe(0)
    })

    it('returns zero for single value', () => {
      expect(calculateEntropy([5])).toBe(0)
    })

    it('returns low entropy for uniform values', () => {
      const values = [5, 5, 5, 5, 5]
      const entropy = calculateEntropy(values)
      expect(entropy).toBeCloseTo(0, 5)
    })
  })
})