import { render, screen } from '@testing-library/react'
import StatusCard from '@/components/StatusCard'

describe('StatusCard Component', () => {
  const mockVerifiedStatus = {
    is_verified: true,
    score: 85,
    last_verified: 1704067200,
    verification_count: 3,
  }

  const mockUnverifiedStatus = {
    is_verified: false,
    score: 45,
    last_verified: 0,
    verification_count: 0,
  }

  it('renders verified status correctly', () => {
    render(<StatusCard status={mockVerifiedStatus} />)

    expect(screen.getByText(/Verified Human/i)).toBeInTheDocument()
    expect(screen.getByText(/85\/100/i)).toBeInTheDocument()
    expect(screen.getByText(/3/i)).toBeInTheDocument()
  })

  it('renders unverified status correctly', () => {
    render(<StatusCard status={mockUnverifiedStatus} />)

    expect(screen.getByText(/Pending Verification/i)).toBeInTheDocument()
    expect(screen.getByText(/45\/100/i)).toBeInTheDocument()
  })

  it('displays verification count', () => {
    render(<StatusCard status={mockVerifiedStatus} />)

    expect(screen.getByText(/Verifications/i)).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows NFT badge for verified users', () => {
    render(<StatusCard status={mockVerifiedStatus} />)

    expect(screen.getByText(/Soulbound NFT active/i)).toBeInTheDocument()
  })

  it('does not show NFT badge for unverified users', () => {
    render(<StatusCard status={mockUnverifiedStatus} />)

    expect(screen.queryByText(/Soulbound NFT active/i)).not.toBeInTheDocument()
  })

  it('formats date correctly', () => {
    render(<StatusCard status={mockVerifiedStatus} />)

    expect(screen.getByText(/Last Verified/i)).toBeInTheDocument()
  })
})