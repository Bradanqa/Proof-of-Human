'use client'

import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export default function Header() {
  const { connected } = useWallet()

  return (
    <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent">
            Proof-of-Human
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/docs" className="text-gray-300 hover:text-white transition-colors">
              Docs
            </Link>
            <Link href="/github" className="text-gray-300 hover:text-white transition-colors">
              GitHub
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {connected && (
              <span className="hidden sm:block text-green-400 text-sm">
                ● Connected
              </span>
            )}
            <WalletMultiButton className="btn-primary" />
          </div>
        </div>
      </div>
    </header>
  )
}