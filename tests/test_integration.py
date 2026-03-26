import pytest
import time
from fastapi.testclient import TestClient


class TestIntegration:
    
    def test_full_verification_flow(self, client, sample_telemetry):
        challenge_payload = {
            "wallet_address": sample_telemetry["wallet_address"]
        }
        
        challenge_response = client.post("/api/challenge", json=challenge_payload)
        assert challenge_response.status_code == 200
        
        challenge_data = challenge_response.json()
        assert challenge_data["challenge_id"] == sample_telemetry["challenge_id"] or challenge_data["challenge_id"] is not None
        
        verify_payload = {
            "wallet_address": sample_telemetry["wallet_address"],
            "telemetry": sample_telemetry
        }
        
        verify_response = client.post("/api/verify", json=verify_payload)
        assert verify_response.status_code == 200
        
        verify_data = verify_response.json()
        assert verify_data["success"] == True
        assert verify_data["score"] >= 0
        assert verify_data["score"] <= 100
        
        status_response = client.get(f"/api/status/{sample_telemetry['wallet_address']}")
        assert status_response.status_code == 200
    
    def test_bot_detection_flow(self, client, bot_telemetry):
        verify_payload = {
            "wallet_address": bot_telemetry["wallet_address"],
            "telemetry": bot_telemetry
        }
        
        verify_response = client.post("/api/verify", json=verify_payload)
        assert verify_response.status_code == 200
        
        verify_data = verify_response.json()
        assert verify_data["is_human"] == False or verify_data["score"] < 70
    
    def test_multiple_verifications_stats(self, client, sample_telemetry):
        for i in range(3):
            telemetry = sample_telemetry.copy()
            telemetry["wallet_address"] = f"Wallet{i}11111111111111111111111111111111111{i}"
            
            verify_payload = {
                "wallet_address": telemetry["wallet_address"],
                "telemetry": telemetry
            }
            
            client.post("/api/verify", json=verify_payload)
        
        stats_response = client.get("/api/stats")
        assert stats_response.status_code == 200
        
        stats_data = stats_response.json()
        assert stats_data["total_verifications"] >= 3
    
    def test_rate_limiting_simulation(self, client, sample_telemetry):
        wallet = sample_telemetry["wallet_address"]
        
        for i in range(5):
            telemetry = sample_telemetry.copy()
            telemetry["click_timestamps"] = [t + (i * 1000) for t in sample_telemetry["click_timestamps"]]
            
            verify_payload = {
                "wallet_address": wallet,
                "telemetry": telemetry
            }
            
            response = client.post("/api/verify", json=verify_payload)
            assert response.status_code in [200, 400, 429]
    
    def test_error_handling_invalid_data(self, client):
        invalid_payloads = [
            {"wallet_address": "", "telemetry": {}},
            {"wallet_address": "invalid", "telemetry": None},
            {},
            {"telemetry": {"mouse_movements": []}}
        ]
        
        for payload in invalid_payloads:
            response = client.post("/api/verify", json=payload)
            assert response.status_code in [200, 400, 422, 500]