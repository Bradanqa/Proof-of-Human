from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    solana_rpc_url: str = "https://api.devnet.solana.com"
    solana_wallet_keypair_path: str = "~/.config/solana/id.json"
    program_id: str = ""
    backend_port: int = 8000
    secret_key: str = "your-secret-key-here-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    ai_model_path: str = "./models/scorer.pkl"
    score_threshold: int = 70
    database_url: str = "postgresql://user:password@localhost:5432/proof_of_human"
    redis_url: str = "redis://localhost:6379"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()