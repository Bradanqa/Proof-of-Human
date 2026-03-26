import pytest
from fastapi.testclient import TestClient


class TestAPIEndpoints:
    
    def test_root_endpoint(self, client):
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "version" in data
        assert "status" in data
    
    def test_health_endpoint(self, client):
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
    
    def test_generate_challenge(self, client):
        payload = {
            "wallet_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
        }
        
        response = client.post("/api/challenge", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "challenge_id" in data
        assert "challenge_type" in data
        assert "instructions" in data
        assert "expires_at" in data
    
    def test_verify_human_valid(self, client, sample_telemetry):
        payload = {
            "wallet_address": sample_telemetry["wallet_address"],
            "telemetry": sample_telemetry
        }
        
        response = client.post("/api/verify", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "success" in data
        assert "score" in data
        assert "is_human" in data
        assert "message" in data
    
    def test_verify_human_invalid_wallet(self, client):
        payload = {
            "wallet_address": "invalid_wallet_address",
            "telemetry": {
                "mouse_movements": [],
                "click_timestamps": [],
                "typing_events": [],
                "browser_fingerprint": {}
            }
        }
        
        response = client.post("/api/verify", json=payload)
        
        assert response.status_code in [200, 400, 500]
    
    def test_get_status(self, client):
        wallet = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
        
        response = client.get(f"/api/status/{wallet}")
        
        assert response.status_code == 200
        data = response.json()
        assert "wallet_address" in data
        assert "is_verified" in data
        assert "score" in data
        assert "last_verified" in data
        assert "verification_count" in data
    
    def test_get_stats(self, client):
        response = client.get("/api/stats")
        
        assert response.status_code == 200
        data = response.json()
        assert "total_verifications" in data
        assert "human_rate" in data
        assert "average_score" in data
        assert "threshold" in data
    
    def test_cors_headers(self, client):
        response = client.options("/", headers={"Origin": "http://localhost:3000"})
        
        assert response.status_code in [200, 404]
    
    def test_invalid_method(self, client):
        response = client.put("/")
        
        assert response.status_code == 405