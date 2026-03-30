'use client'

export default function StatsCard({ stats }: { stats: any }) {
  if (!stats) {
    return (
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Network Stats</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Network Stats</h3>
      <div className="space-y-4">
        <div>
          <p className="text-gray-400 text-sm">Total Verifications</p>
          <p className="text-2xl font-bold text-white">
            {stats.total_verifications.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Human Rate</p>
          <p className="text-2xl font-bold text-solana-green">
            {(stats.human_rate * 100).toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Average Score</p>
          <p className="text-2xl font-bold text-primary-400">
            {stats.average_score.toFixed(1)}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Threshold</p>
          <p className="text-2xl font-bold text-yellow-400">
            {stats.threshold}
          </p>
        </div>
      </div>
    </div>
  )
}