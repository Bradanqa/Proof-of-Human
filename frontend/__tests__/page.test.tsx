import { render, screen, waitFor } from '@testing-library/react'
import Home from '@/app/page'
import { WalletContextProvider } from '@/components/providers/WalletContextProvider'

global.fetch = jest.fn()

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the main heading', () => {
    render(
      <WalletContextProvider>
        <Home />
      </WalletContextProvider>
    )

    expect(screen.getByText(/Proof-of-Human/i)).toBeInTheDocument()
  })

  it('renders the description text', () => {
    render(
      <WalletContextProvider>
        <Home />
      </WalletContextProvider>
    )

    expect(screen.getByText(/AI-Powered Sybil Resistance Protocol/i)).toBeInTheDocument()
  })

  it('renders feature cards', () => {
    render(
      <WalletContextProvider>
        <Home />
      </WalletContextProvider>
    )

    expect(screen.getByText(/AI Analysis/i)).toBeInTheDocument()
    expect(screen.getByText(/Privacy First/i)).toBeInTheDocument()
    expect(screen.getByText(/Soulbound NFT/i)).toBeInTheDocument()
  })

  it('renders wallet connection button', () => {
    render(
      <WalletContextProvider>
        <Home />
      </WalletContextProvider>
    )

    expect(screen.getByText(/Select Wallet/i)).toBeInTheDocument()
  })
})