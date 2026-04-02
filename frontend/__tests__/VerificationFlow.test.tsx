import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import VerificationFlow from '@/components/VerificationFlow'

global.fetch = jest.fn()

describe('VerificationFlow Component', () => {
  const mockOnVerifyComplete = jest.fn()
  const mockWalletAddress = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'

  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        challenge_id: 'challenge_1234567890_7xKXtg2C',
        challenge_type: 'behavioral',
        instructions: 'Complete the following tasks',
        expires_at: Date.now() + 300000,
      }),
    })
  })

  it('renders initial step', async () => {
    render(
      <VerificationFlow
        walletAddress={mockWalletAddress}
        onVerifyComplete={mockOnVerifyComplete}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Move Mouse/i)).toBeInTheDocument()
    })
  })

  it('renders step indicators', async () => {
    render(
      <VerificationFlow
        walletAddress={mockWalletAddress}
        onVerifyComplete={mockOnVerifyComplete}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Step 1 of 3/i)).toBeInTheDocument()
    })
  })

  it('renders mouse movement area', async () => {
    render(
      <VerificationFlow
        walletAddress={mockWalletAddress}
        onVerifyComplete={mockOnVerifyComplete}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Click and move mouse here/i)).toBeInTheDocument()
    })
  })

  it('navigates to next step', async () => {
    render(
      <VerificationFlow
        walletAddress={mockWalletAddress}
        onVerifyComplete={mockOnVerifyComplete}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Move Mouse/i)).toBeInTheDocument()
    })

    const nextButton = screen.getByText(/Next/i)
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Type Text/i)).toBeInTheDocument()
    })
  })

  it('navigates back to previous step', async () => {
    render(
      <VerificationFlow
        walletAddress={mockWalletAddress}
        onVerifyComplete={mockOnVerifyComplete}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Move Mouse/i)).toBeInTheDocument()
    })

    const nextButton = screen.getByText(/Next/i)
    fireEvent.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText(/Type Text/i)).toBeInTheDocument()
    })

    const backButton = screen.getByText(/Back/i)
    fireEvent.click(backButton)

    await waitFor(() => {
      expect(screen.getByText(/Move Mouse/i)).toBeInTheDocument()
    })
  })

  it('handles text input', async () => {
    render(
      <VerificationFlow
        walletAddress={mockWalletAddress}
        onVerifyComplete={mockOnVerifyComplete}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Move Mouse/i)).toBeInTheDocument()
    })

    const nextButton = screen.getByText(/Next/i)
    fireEvent.click(nextButton)

    await waitFor(() => {
      const input = screen.getByPlaceholderText(/Type here/i)
      fireEvent.change(input, { target: { value: 'The quick brown fox' } })
      expect(input).toHaveValue('The quick brown fox')
    })
  })

  it('disables submit button when requirements not met', async () => {
    render(
      <VerificationFlow
        walletAddress={mockWalletAddress}
        onVerifyComplete={mockOnVerifyComplete}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Move Mouse/i)).toBeInTheDocument()
    })

    const nextButton = screen.getByText(/Next/i)
    fireEvent.click(nextButton)
    fireEvent.click(screen.getByText(/Next/i))

    await waitFor(() => {
      const submitButton = screen.getByText(/Submit Verification/i)
      expect(submitButton).toBeDisabled()
    })
  })

  it('submits verification successfully', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        challenge_id: 'challenge_1234567890_7xKXtg2C',
      }),
    }).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        score: 85,
        is_human: true,
        message: 'Human verified',
      }),
    })

    render(
      <VerificationFlow
        walletAddress={mockWalletAddress}
        onVerifyComplete={mockOnVerifyComplete}
      />
    )

    await waitFor(() => {
      expect(screen.getByText(/Move Mouse/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText(/Next/i))
    fireEvent.click(screen.getByText(/Next/i))

    await waitFor(() => {
      const submitButton = screen.getByText(/Submit Verification/i)
      expect(submitButton).toBeInTheDocument()
    })
  })
})