'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface VerificationFlowProps {
  walletAddress: string
  onVerifyComplete: () => void
}

export default function VerificationFlow({ walletAddress, onVerifyComplete }: VerificationFlowProps) {
  const [step, setStep] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [score, setScore] = useState<number>(0)
  const [challengeId, setChallengeId] = useState<string>('')
  
  const [mouseMovements, setMouseMovements] = useState<number[][]>([])
  const [clickTimestamps, setClickTimestamps] = useState<number[]>([])
  const [typingEvents, setTypingEvents] = useState<any[]>([])
  const [textInput, setTextInput] = useState<string>('')

  const containerRef = useRef<HTMLDivElement>(null)
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        setMouseMovements(prev => [...prev.slice(-50), [x, y]])
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    fetchChallenge()
  }, [])

  const fetchChallenge = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/challenge`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet_address: walletAddress }),
        }
      )
      const data = await response.json()
      setChallengeId(data.challenge_id)
    } catch (error) {
      toast.error('Failed to load challenge')
    }
  }

  const handleAreaClick = () => {
    setClickTimestamps(prev => [...prev, Date.now() - startTimeRef.current])
  }

  const handleTextInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const timestamp = Date.now() - startTimeRef.current
    
    if (value.length > textInput.length) {
      setTypingEvents(prev => [...prev, { 
        key: value[value.length - 1], 
        interval: timestamp,
        timestamp: Date.now()
      }])
    }
    
    setTextInput(value)
  }

  const submitVerification = async () => {
    setIsLoading(true)

    const typingEventsWithIntervals = typingEvents.map((event, index) => ({
      key: event.key,
      interval: index > 0 ? event.timestamp - typingEvents[index - 1].timestamp : 0,
      timestamp: event.timestamp
    }))

    const browserFingerprint = {
      canvas_entropy: Math.random() * 5,
      webgl_entropy: Math.random() * 5,
      is_mobile: /Mobile/i.test(navigator.userAgent),
      screen_width: window.screen.width,
      screen_height: window.screen.height,
    }

    const payload = {
      wallet_address: walletAddress,
      telemetry: {
        mouse_movements: mouseMovements,
        click_timestamps: clickTimestamps,
        typing_events: typingEventsWithIntervals,
        browser_fingerprint: browserFingerprint,
        challenge_id: challengeId,
      },
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )

      const data = await response.json()

      if (data.success) {
        setScore(data.score)
        setStep(3)
        
        if (data.is_human) {
          toast.success('Verification successful!')
        } else {
          toast.error('Score below threshold. Please try again.')
        }
        
        onVerifyComplete()
      } else {
        toast.error('Verification failed')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    {
      title: 'Move Mouse',
      description: 'Move your mouse randomly in the area below',
      component: (
        <div
          ref={containerRef}
          onClick={handleAreaClick}
          className="h-64 bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center cursor-crosshair hover:border-primary-500 transition-colors"
        >
          <p className="text-gray-400">Click and move mouse here</p>
        </div>
      ),
    },
    {
      title: 'Type Text',
      description: 'Type the following text exactly as shown',
      component: (
        <div className="space-y-4">
          <div className="bg-gray-700/50 rounded-lg p-4 text-center">
            <code className="text-xl text-solana-green">The quick brown fox</code>
          </div>
          <input
            type="text"
            value={textInput}
            onChange={handleTextInput}
            placeholder="Type here..."
            className="input-field"
            autoComplete="off"
          />
          <div className="text-sm text-gray-400">
            Characters: {textInput.length} / 19
          </div>
        </div>
      ),
    },
    {
      title: 'Confirm',
      description: 'Review and submit your verification',
      component: (
        <div className="space-y-4">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Mouse Points:</span>
                <p className="text-white">{mouseMovements.length}</p>
              </div>
              <div>
                <span className="text-gray-400">Clicks:</span>
                <p className="text-white">{clickTimestamps.length}</p>
              </div>
              <div>
                <span className="text-gray-400">Keystrokes:</span>
                <p className="text-white">{typingEvents.length}</p>
              </div>
              <div>
                <span className="text-gray-400">Text Length:</span>
                <p className="text-white">{textInput.length}</p>
              </div>
            </div>
          </div>
          <button
            onClick={submitVerification}
            disabled={isLoading || mouseMovements.length < 10 || clickTimestamps.length < 3 || textInput.length < 10}
            className="btn-primary w-full"
          >
            {isLoading ? 'Verifying...' : 'Submit Verification'}
          </button>
        </div>
      ),
    },
    {
      title: 'Complete',
      description: 'Verification completed',
      component: (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold mb-2">Score: {score}/100</h3>
          <p className="text-gray-400 mb-4">
            {score >= 70 
              ? 'Congratulations! You are verified as human.' 
              : 'Score below threshold. Please try again.'}
          </p>
          {score >= 70 && (
            <div className="bg-green-900/50 border border-green-700 rounded-lg p-4">
              <p className="text-green-400">✓ Soulbound NFT minted to your wallet</p>
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-colors ${
                i <= step ? 'bg-primary-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
        <span className="text-gray-400 text-sm">Step {step + 1} of 3</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl font-bold mb-2">{steps[step].title}</h3>
          <p className="text-gray-400 mb-6">{steps[step].description}</p>
          {steps[step].component}
        </motion.div>
      </AnimatePresence>

      {step < 2 && (
        <div className="flex justify-between pt-4">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="btn-secondary"
          >
            Back
          </button>
          <button
            onClick={() => setStep(Math.min(2, step + 1))}
            className="btn-primary"
          >
            {step === 2 ? 'Submit' : 'Next'}
          </button>
        </div>
      )}
    </div>
  )
}