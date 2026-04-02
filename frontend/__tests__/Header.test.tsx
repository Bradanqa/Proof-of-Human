import { render, screen } from '@testing-library/react'
import Header from '@/components/Header'
import { WalletContextProvider } from '@/components/providers/WalletContextProvider'

describe('Header Component', () => {
  it('renders logo', () => {
    render(
      <WalletContextProvider>
        <Header />
      </WalletContextProvider>
    )

    expect(screen.getByText(/Proof-of-Human/i)).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(
      <WalletContextProvider>
        <Header />
      </WalletContextProvider>
    )

    expect(screen.getByText(/Home/i)).toBeInTheDocument()
    expect(screen.getByText(/Docs/i)).toBeInTheDocument()
    expect(screen.getByText(/GitHub/i)).toBeInTheDocument()
  })

  it('renders wallet button', () => {
    render(
      <WalletContextProvider>
        <Header />
      </WalletContextProvider>
    )

    expect(screen.getByText(/Select Wallet/i)).toBeInTheDocument()
  })
})