import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalletContextProvider } from '@/components/providers/WalletContextProvider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Proof-of-Human | AI-Powered Sybil Resistance',
  description: 'Decentralized human verification system for Solana',
  keywords: ['Solana', 'Web3', 'AI', 'Sybil Resistance', 'Proof-of-Human'],
  authors: [{ name: 'Proof-of-Human Team' }],
  openGraph: {
    title: 'Proof-of-Human',
    description: 'AI-Powered Sybil Resistance Protocol for Solana',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletContextProvider>
          {children}
          <Toaster position="top-right" />
        </WalletContextProvider>
      </body>
    </html>
  )
}