import { render, screen } from '@testing-library/react'
import Footer from '@/components/Footer'

describe('Footer Component', () => {
  it('renders project name', () => {
    render(<Footer />)

    expect(screen.getByText(/Proof-of-Human/i)).toBeInTheDocument()
  })

  it('renders resources section', () => {
    render(<Footer />)

    expect(screen.getByText(/Resources/i)).toBeInTheDocument()
    expect(screen.getByText(/Documentation/i)).toBeInTheDocument()
    expect(screen.getByText(/API Reference/i)).toBeInTheDocument()
  })

  it('renders community section', () => {
    render(<Footer />)

    expect(screen.getByText(/Community/i)).toBeInTheDocument()
    expect(screen.getByText(/Twitter/i)).toBeInTheDocument()
    expect(screen.getByText(/Discord/i)).toBeInTheDocument()
  })

  it('renders legal section', () => {
    render(<Footer />)

    expect(screen.getByText(/Legal/i)).toBeInTheDocument()
    expect(screen.getByText(/Privacy Policy/i)).toBeInTheDocument()
    expect(screen.getByText(/Terms of Service/i)).toBeInTheDocument()
  })

  it('renders copyright', () => {
    render(<Footer />)

    expect(screen.getByText(/MIT License/i)).toBeInTheDocument()
  })
})