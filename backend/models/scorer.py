import numpy as np
from typing import List, Dict
from datetime import datetime
import pickle
import os
from config import settings


class HumanScorer:
    def __init__(self):
        self.total_verifications = 0
        self.human_count = 0
        self.score_sum = 0
        self.model = None
        self.is_trained = False
        
        self._load_model()
    
    def _load_model(self):
        if os.path.exists(settings.ai_model_path):
            try:
                with open(settings.ai_model_path, "rb") as f:
                    self.model = pickle.load(f)
                self.is_trained = True
            except Exception:
                self.is_trained = False
    
    def calculate_score(self, telemetry: Dict) -> int:
        features = self._extract_features(telemetry)
        
        if self.is_trained and self.model is not None:
            try:
                prediction = self.model.predict_proba([features])[0][1]
                score = int(prediction * 100)
            except Exception:
                score = self._heuristic_score(features)
        else:
            score = self._heuristic_score(features)
        
        self._update_stats(score)
        
        return max(0, min(100, score))
    
    def _extract_features(self, telemetry: Dict) -> List[float]:
        features = []
        
        mouse_movements = telemetry.get("mouse_movements", [])
        click_timestamps = telemetry.get("click_timestamps", [])
        typing_events = telemetry.get("typing_events", [])
        
        if len(mouse_movements) > 1:
            mouse_distances = []
            for i in range(1, len(mouse_movements)):
                dx = mouse_movements[i][0] - mouse_movements[i-1][0]
                dy = mouse_movements[i][1] - mouse_movements[i-1][1]
                distance = np.sqrt(dx**2 + dy**2)
                mouse_distances.append(distance)
            
            avg_mouse_speed = np.mean(mouse_distances) if mouse_distances else 0
            mouse_std = np.std(mouse_distances) if len(mouse_distances) > 1 else 0
            mouse_entropy = self._calculate_entropy(mouse_distances)
        else:
            avg_mouse_speed = 0
            mouse_std = 0
            mouse_entropy = 0
        
        features.extend([avg_mouse_speed, mouse_std, mouse_entropy])
        
        if len(click_timestamps) > 1:
            click_intervals = [
                click_timestamps[i] - click_timestamps[i-1]
                for i in range(1, len(click_timestamps))
            ]
            avg_click_interval = np.mean(click_intervals)
            click_std = np.std(click_intervals) if len(click_intervals) > 1 else 0
            min_click_interval = min(click_intervals)
        else:
            avg_click_interval = 0
            click_std = 0
            min_click_interval = 0
        
        features.extend([avg_click_interval, click_std, min_click_interval])
        
        if typing_events:
            typing_intervals = [
                event.get("interval", 0) for event in typing_events
            ]
            avg_typing_speed = np.mean(typing_intervals) if typing_intervals else 0
            typing_std = np.std(typing_intervals) if len(typing_intervals) > 1 else 0
            typing_variance = typing_std ** 2
        else:
            avg_typing_speed = 0
            typing_std = 0
            typing_variance = 0
        
        features.extend([avg_typing_speed, typing_std, typing_variance])
        
        fingerprint = telemetry.get("browser_fingerprint", {})
        features.append(fingerprint.get("canvas_entropy", 0))
        features.append(fingerprint.get("webgl_entropy", 0))
        features.append(1 if fingerprint.get("is_mobile", False) else 0)
        
        while len(features) < 15:
            features.append(0)
        
        return features[:15]
    
    def _calculate_entropy(self, values: List[float]) -> float:
        if not values or len(values) < 2:
            return 0
        
        hist, _ = np.histogram(values, bins=10)
        hist = hist[hist > 0]
        probabilities = hist / np.sum(hist)
        
        entropy = -np.sum(probabilities * np.log2(probabilities + 1e-10))
        
        return entropy
    
    def _heuristic_score(self, features: List[float]) -> int:
        score = 50
        
        avg_mouse_speed = features[0]
        mouse_entropy = features[2]
        min_click_interval = features[5]
        typing_variance = features[8]
        canvas_entropy = features[9]
        
        if mouse_entropy > 2.0:
            score += 15
        elif mouse_entropy > 1.0:
            score += 8
        
        if min_click_interval > 100:
            score += 15
        elif min_click_interval > 50:
            score += 8
        elif min_click_interval < 30:
            score -= 20
        
        if typing_variance > 1000:
            score += 10
        elif typing_variance > 500:
            score += 5
        
        if canvas_entropy > 3.0:
            score += 10
        elif canvas_entropy > 2.0:
            score += 5
        
        if avg_mouse_speed > 0 and avg_mouse_speed < 500:
            score += 5
        
        return score
    
    def _update_stats(self, score: int):
        self.total_verifications += 1
        self.score_sum += score
        
        if score >= settings.score_threshold:
            self.human_count += 1
    
    @property
    def human_rate(self) -> float:
        if self.total_verifications == 0:
            return 0.0
        return self.human_count / self.total_verifications
    
    @property
    def average_score(self) -> float:
        if self.total_verifications == 0:
            return 0.0
        return self.score_sum / self.total_verifications
    
    def save_model(self, path: str = None):
        if path is None:
            path = settings.ai_model_path
        
        os.makedirs(os.path.dirname(path), exist_ok=True)
        
        with open(path, "wb") as f:
            pickle.dump(self.model, f)
    
    def train(self, training_ List[Dict], labels: List[int]):
        from sklearn.ensemble import RandomForestClassifier
        
        X = [self._extract_features(data) for data in training_data]
        y = labels
        
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        
        self.model.fit(X, y)
        self.is_trained = True
        
        self.save_model()