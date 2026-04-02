import '@testing-library/jest-dom'

global.fetch = jest.fn()

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
})

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
})

jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({
    connected: false,
    connecting: false,
    disconnecting: false,
    publicKey: null,
    wallet: null,
    wallets: [],
    autoConnect: false,
    connect: jest.fn(),
    disconnect: jest.fn(),
    select: jest.fn(),
  }),
  useConnection: () => ({
    connection: {
      rpcEndpoint: 'https://api.devnet.solana.com',
    },
  }),
}))

jest.mock('@solana/wallet-adapter-react-ui', () => ({
  WalletMultiButton: () => <button>Select Wallet</button>,
  WalletModalProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    promise: jest.fn(),
  },
  Toaster: () => <div data-testid="toaster" />,
}))