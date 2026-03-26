import pytest
import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from main import app
from models.scorer import HumanScorer
from services.solana import SolanaService


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def scorer():
    return HumanScorer()


@pytest.fixture
def solana_service():
    return SolanaService()


@pytest.fixture
def sample_telemetry():
    return {
        "wallet_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
        "mouse_movements": [
            [100, 200],
            [150, 220],
            [180, 250],
            [200, 280],
            [250, 300]
        ],
        "click_timestamps": [1000, 1200, 1500, 1900, 2400],
        "typing_events": [
            {"key": "a", "interval": 150},
            {"key": "b", "interval": 180},
            {"key": "c", "interval": 160},
            {"key": "d", "interval": 200}
        ],
        "browser_fingerprint": {
            "canvas_entropy": 4.5,
            "webgl_entropy": 3.8,
            "is_mobile": False
        },
        "challenge_id": "challenge_1234567890_7xKXtg2C"
    }


@pytest.fixture
def bot_telemetry():
    return {
        "wallet_address": "9xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsV",
        "mouse_movements": [
            [100, 200],
            [100, 200],
            [100, 200]
        ],
        "click_timestamps": [1000, 1050, 1100, 1150, 1200],
        "typing_events": [
            {"key": "a", "interval": 50},
            {"key": "b", "interval": 50},
            {"key": "c", "interval": 50}
        ],
        "browser_fingerprint": {
            "canvas_entropy": 0.5,
            "webgl_entropy": 0.3,
            "is_mobile": False
        },
        "challenge_id": "challenge_1234567891_9xKXtg2C"
    }