import { render, screen } from '@testing-library/react'
import StatsCard from '@/components/StatsCard'

describe('StatsCard Component', () => {
  const mockStats = {
    total_verifications: 1500,
    human_rate: 0.85,
    average_score: 72.5,
    threshold: 70,
  }

  it('renders loading state when no stats', () => {
    render(<StatsCard stats={null} />)

    expect(screen.getByText(/Network Stats/i)).toBeInTheDocument()
  })

  it('renders total verifications', () => {
    render(<StatsCard stats={mockStats} />)

    expect(screen.getByText(/Total Verifications/i)).toBeInTheDocument()
    expect(screen.getByText('1,500')).toBeInTheDocument()
  })

  it('renders human rate percentage', () => {
    render(<StatsCard stats={mockStats} />)

    expect(screen.getByText(/Human Rate/i)).toBeInTheDocument()
    expect(screen.getByText('85.0%')).toBeInTheDocument()
  })

  it('renders average score', () => {
    render(<StatsCard stats={mockStats} />)

    expect(screen.getByText(/Average Score/i)).toBeInTheDocument()
    expect(screen.getByText('72.5')).toBeInTheDocument()
  })

  it('renders threshold value', () => {
    render(<StatsCard stats={mockStats} />)

    expect(screen.getByText(/Threshold/i)).toBeInTheDocument()
    expect(screen.getByText('70')).toBeInTheDocument()
  })

  it('handles zero values', () => {
    const zeroStats = {
      total_verifications: 0,
      human_rate: 0,
      average_score: 0,
      threshold: 70,
    }

    render(<StatsCard stats={zeroStats} />)

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('0.0%')).toBeInTheDocument()
  })
})