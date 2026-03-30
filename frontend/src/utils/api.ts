const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export async function fetchChallenge(walletAddress: string) {
  const response = await fetch(`${API_URL}/api/challenge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet_address: walletAddress }),
  })
  return response.json()
}

export async function submitVerification(payload: any) {
  const response = await fetch(`${API_URL}/api/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return response.json()
}

export async function fetchStatus(walletAddress: string) {
  const response = await fetch(`${API_URL}/api/status/${walletAddress}`)
  return response.json()
}

export async function fetchStats() {
  const response = await fetch(`${API_URL}/api/stats`)
  return response.json()
}