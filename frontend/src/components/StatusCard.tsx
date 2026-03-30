'use client'

interface StatusCardProps {
  status: {
    is_verified: boolean
    score: number
    last_verified: number
    verification_count: number
  }
}

export default function StatusCard({ status }: StatusCardProps) {
  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'Never'
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="text-6xl mb-4">
          {status.is_verified ? '✅' : '⏳'}
        </div>
        <h3 className="text-2xl font-bold mb-2">
          {status.is_verified ? 'Verified Human' : 'Pending Verification'}
        </h3>
        <p className={`text-4xl font-bold ${getScoreColor(status.score)}`}>
          {status.score}/100
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700/50 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Last Verified</p>
          <p className="text-white font-semibold">
            {formatDate(status.last_verified)}
          </p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <p className="text-gray-400 text-sm">Verifications</p>
          <p className="text-white font-semibold">{status.verification_count}</p>
        </div>
      </div>

      {status.is_verified && (
        <div className="bg-green-900/50 border border-green-700 rounded-lg p-4">
          <p className="text-green-400 text-sm">
            ✓ Soulbound NFT active in your wallet
          </p>
        </div>
      )}
    </div>
  )
}