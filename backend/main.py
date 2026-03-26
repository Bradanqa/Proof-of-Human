from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import time
import base64
from config import settings
from models.scorer import HumanScorer
from services.solana import SolanaService

app = FastAPI(
    title="Proof-of-Human API",
    description="AI-Powered Sybil Resistance Protocol",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scorer = HumanScorer()
solana_service = SolanaService()


class TelemetryData(BaseModel):
    wallet_address: str
    mouse_movements: List[List[float]]
    click_timestamps: List[int]
    typing_events: List[dict]
    browser_fingerprint: dict
    challenge_id: str


class VerificationRequest(BaseModel):
    wallet_address: str
    telemetry: TelemetryData


class VerificationResponse(BaseModel):
    success: bool
    score: int
    is_human: bool
    transaction_signature: Optional[str] = None
    message: str


class StatusResponse(BaseModel):
    wallet_address: str
    is_verified: bool
    score: int
    last_verified: int
    verification_count: int


class ChallengeRequest(BaseModel):
    wallet_address: str


class ChallengeResponse(BaseModel):
    challenge_id: str
    challenge_type: str
    instructions: str
    expires_at: int


@app.get("/")
async def root():
    return {
        "name": "Proof-of-Human API",
        "version": "0.1.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": int(time.time())}


@app.post("/api/challenge", response_model=ChallengeResponse)
async def generate_challenge(request: ChallengeRequest):
    challenge_id = f"challenge_{int(time.time())}_{request.wallet_address[:8]}"
    
    return ChallengeResponse(
        challenge_id=challenge_id,
        challenge_type="behavioral",
        instructions="Complete the following tasks: move mouse randomly, click buttons, type text",
        expires_at=int(time.time()) + 300
    )


@app.post("/api/verify", response_model=VerificationResponse)
async def verify_human(request: VerificationRequest):
    try:
        score = scorer.calculate_score(request.telemetry)
        is_human = score >= settings.score_threshold
        
        transaction_signature = None
        
        if is_human:
            signature = solana_service.sign_verification(
                request.wallet_address,
                score,
                int(time.time())
            )
            transaction_signature = base64.b64encode(signature).decode("utf-8")
            
            solana_service.submit_verification(
                request.wallet_address,
                score,
                int(time.time()),
                signature
            )
        
        return VerificationResponse(
            success=True,
            score=score,
            is_human=is_human,
            transaction_signature=transaction_signature,
            message="Human verified" if is_human else "Score below threshold"
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@app.get("/api/status/{wallet_address}", response_model=StatusResponse)
async def get_status(wallet_address: str):
    try:
        status_data = solana_service.get_human_status(wallet_address)
        
        return StatusResponse(
            wallet_address=wallet_address,
            is_verified=status_data.get("is_verified", False),
            score=status_data.get("score", 0),
            last_verified=status_data.get("last_verified", 0),
            verification_count=status_data.get("verification_count", 0)
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@app.get("/api/stats")
async def get_stats():
    return {
        "total_verifications": scorer.total_verifications,
        "human_rate": scorer.human_rate,
        "average_score": scorer.average_score,
        "threshold": settings.score_threshold
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.backend_port)