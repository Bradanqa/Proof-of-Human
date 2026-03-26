import pytest
from models.scorer import HumanScorer


class TestHumanScorer:
    
    def test_scorer_initialization(self, scorer):
        assert scorer is not None
        assert scorer.total_verifications == 0
        assert scorer.human_count == 0
        assert scorer.score_sum == 0
    
    def test_calculate_score_human_behavior(self, scorer, sample_telemetry):
        score = scorer.calculate_score(sample_telemetry)
        
        assert isinstance(score, int)
        assert 0 <= score <= 100
        assert score >= 50
    
    def test_calculate_score_bot_behavior(self, scorer, bot_telemetry):
        score = scorer.calculate_score(bot_telemetry)
        
        assert isinstance(score, int)
        assert 0 <= score <= 100
        assert score < 70
    
    def test_extract_features(self, scorer, sample_telemetry):
        features = scorer._extract_features(sample_telemetry)
        
        assert isinstance(features, list)
        assert len(features) == 15
        assert all(isinstance(f, (int, float)) for f in features)
    
    def test_calculate_entropy(self, scorer):
        values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        entropy = scorer._calculate_entropy(values)
        
        assert isinstance(entropy, float)
        assert entropy >= 0
    
    def test_calculate_entropy_empty(self, scorer):
        entropy = scorer._calculate_entropy([])
        assert entropy == 0
    
    def test_heuristic_score(self, scorer):
        features = [100, 50, 3.0, 200, 100, 150, 0, 0, 2000, 4.0, 3.5, 0, 0, 0, 0]
        score = scorer._heuristic_score(features)
        
        assert isinstance(score, int)
        assert 0 <= score <= 100
    
    def test_update_stats(self, scorer):
        initial_verifications = scorer.total_verifications
        
        scorer._update_stats(80)
        
        assert scorer.total_verifications == initial_verifications + 1
        assert scorer.human_count == 1
    
    def test_human_rate(self, scorer):
        scorer._update_stats(80)
        scorer._update_stats(85)
        scorer._update_stats(40)
        
        rate = scorer.human_rate
        
        assert isinstance(rate, float)
        assert 0 <= rate <= 1
    
    def test_average_score(self, scorer):
        scorer._update_stats(80)
        scorer._update_stats(90)
        
        avg = scorer.average_score
        
        assert isinstance(avg, float)
        assert avg == 85.0
    
    def test_score_boundary_conditions(self, scorer):
        telemetry = {
            "mouse_movements": [],
            "click_timestamps": [],
            "typing_events": [],
            "browser_fingerprint": {}
        }
        
        score = scorer.calculate_score(telemetry)
        
        assert 0 <= score <= 100