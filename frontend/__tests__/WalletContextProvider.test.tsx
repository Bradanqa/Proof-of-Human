import { render, screen } from '@testing-library/react'
import { WalletContextProvider } from '@/components/providers/WalletContextProvider'
import { useWallet } from '@solana/wallet-adapter-react'

const TestComponent = () => {
  const { connected, publicKey } = useWallet()

  return (
    <div>
      <span data-testid="connected">{connected ? 'true' : 'false'}</span>
      <span data-testid="public-key">{publicKey?.toString() || 'none'}</span>
    </div>
  )
}

describe('WalletContextProvider', () => {
  it('provides wallet context to children', () => {
    render(
      <WalletContextProvider>
        <TestComponent />
      </WalletContextProvider>
    )

    expect(screen.getByTestId('connected')).toBeInTheDocument()
    expect(screen.getByTestId('public-key')).toBeInTheDocument()
  })

  it('initializes with disconnected state', () => {
    render(
      <WalletContextProvider>
        <TestComponent />
      </WalletContextProvider>
    )

    expect(screen.getByTestId('connected').textContent).toBe('false')
  })

  it('renders wallet adapter UI', () => {
    render(
      <WalletContextProvider>
        <div>Test</div>
      </WalletContextProvider>
    )

    expect(screen.getByText(/Test/i)).toBeInTheDocument()
  })
})