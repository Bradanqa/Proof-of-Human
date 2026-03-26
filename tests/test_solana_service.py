import pytest
from services.solana import SolanaService


class TestSolanaService:
    
    def test_service_initialization(self, solana_service):
        assert solana_service is not None
        assert solana_service.rpc_url is not None
        assert solana_service.client is not None
    
    def test_sign_verification(self, solana_service):
        wallet = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
        score = 85
        timestamp = 1234567890
        
        signature = solana_service.sign_verification(wallet, score, timestamp)
        
        assert isinstance(signature, bytes)
        assert len(signature) > 0
    
    def test_sign_verification_consistency(self, solana_service):
        wallet = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
        score = 85
        timestamp = 1234567890
        
        sig1 = solana_service.sign_verification(wallet, score, timestamp)
        sig2 = solana_service.sign_verification(wallet, score, timestamp)
        
        assert sig1 == sig2
    
    def test_get_human_status_new_wallet(self, solana_service):
        wallet = "NewWallet111111111111111111111111111111111111"
        
        status = solana_service.get_human_status(wallet)
        
        assert isinstance(status, dict)
        assert "is_verified" in status
        assert "score" in status
        assert "last_verified" in status
        assert "verification_count" in status
        assert status["is_verified"] == False
        assert status["score"] == 0
    
    def test_derive_pda(self, solana_service):
        from solders.pubkey import Pubkey
        
        program_id = Pubkey.from_string(solana_service.program_id)
        pda = solana_service._derive_pda(b"state", program_id=program_id)
        
        assert pda is not None
        assert isinstance(pda, Pubkey)
    
    def test_encode_verify_instruction(self, solana_service):
        score = 85
        timestamp = 1234567890
        signature = b"test_signature_bytes"
        
        encoded = solana_service._encode_verify_instruction(score, timestamp, signature)
        
        assert isinstance(encoded, bytes)
        assert len(encoded) > 0
    
    def test_encode_initialize_instruction(self, solana_service):
        from solders.pubkey import Pubkey
        
        admin = Pubkey([1] * 32)
        encoded = solana_service._encode_initialize_instruction(admin)
        
        assert isinstance(encoded, bytes)
        assert len(encoded) == 40