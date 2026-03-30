'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { motion } from 'framer-motion'
import VerificationFlow from '@/components/VerificationFlow'
import StatusCard from '@/components/StatusCard'
import StatsCard from '@/components/StatsCard'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Home() {
  const { connected, publicKey } = useWallet()
  const [verificationStatus, setVerificationStatus] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    if (connected && publicKey) {
      fetchStatus()
      fetchStats()
    }
  }, [connected, publicKey])

  const fetchStatus = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/status/${publicKey?.toString()}`
      )
      const data = await response.json()
      setVerificationStatus(data)
    } catch (error) {
      console.error('Failed to fetch status:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stats`
      )
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent">
            Proof-of-Human
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            AI-Powered Sybil Resistance Protocol for Solana. Verify your humanity and earn Soulbound NFTs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StatsCard stats={stats} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Verification</h2>
                <WalletMultiButton className="btn-primary" />
              </div>

              {connected ? (
                verificationStatus?.is_verified ? (
                  <StatusCard status={verificationStatus} />
                ) : (
                  <VerificationFlow 
                    walletAddress={publicKey?.toString() || ''}
                    onVerifyComplete={fetchStatus}
                  />
                )
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">
                    Connect your Solana wallet to start verification
                  </p>
                  <WalletMultiButton className="btn-primary" />
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="card text-center">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-bold mb-2">AI Analysis</h3>
            <p className="text-gray-400">
              Behavioral biometrics analyze your interaction patterns in real-time
            </p>
          </div>

          <div className="card text-center">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold mb-2">Privacy First</h3>
            <p className="text-gray-400">
              No KYC required. Your data stays private and secure
            </p>
          </div>

          <div className="card text-center">
            <div className="text-4xl mb-4">🎫</div>
            <h3 className="text-xl font-bold mb-2">Soulbound NFT</h3>
            <p className="text-gray-400">
              Receive non-transferable NFT as proof of humanity
            </p>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  )
}