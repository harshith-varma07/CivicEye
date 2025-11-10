"""
Priority predictor using efficient scoring algorithm
Optimized with lookup tables and minimal computation
"""
from typing import Dict


class PriorityPredictor:
    """Predict issue priority using optimized scoring system"""
    
    def __init__(self):
        # Category weights - use dict for O(1) lookup
        self.category_weights = {
            'pothole': 0.7,
            'streetlight': 0.5,
            'garbage': 0.6,
            'water': 0.8,
            'sewage': 0.9,
            'traffic': 0.8,
            'park': 0.4,
            'building': 0.7,
            'other': 0.5
        }
        
        # Priority thresholds (optimized for quick classification)
        self.thresholds = {
            'critical': 0.8,
            'high': 0.6,
            'medium': 0.4,
            'low': 0.0
        }
    
    def predict_priority(
        self,
        category: str,
        upvote_count: int = 0,
        verification_count: int = 0,
        age_days: int = 0,
        has_media: bool = False
    ) -> Dict:
        """
        Predict priority using optimized scoring algorithm
        
        Args:
            category: Issue category
            upvote_count: Number of upvotes
            verification_count: Number of verifications
            age_days: Age of issue in days
            has_media: Whether issue has media attachments
        
        Returns:
            Dict with priority and score
        """
        # Start with category base weight (O(1) dict lookup)
        score = self.category_weights.get(category, 0.5)
        
        # Add upvote influence (normalized to 0-0.2 range)
        # Using min() to cap the contribution
        upvote_score = min(upvote_count * 0.02, 0.2)
        score += upvote_score
        
        # Add verification influence (normalized to 0-0.15 range)
        verification_score = min(verification_count * 0.03, 0.15)
        score += verification_score
        
        # Age penalty - older unresolved issues get higher priority
        # Using min() to avoid excessive contribution
        if age_days > 7:
            age_score = min((age_days - 7) * 0.01, 0.1)
            score += age_score
        
        # Media bonus - issues with evidence get slight boost
        if has_media:
            score += 0.05
        
        # Normalize score to 0-1 range
        score = min(score, 1.0)
        
        # Determine priority level using optimized threshold check
        priority = self._get_priority_level(score)
        
        return {
            'priority': priority,
            'score': round(score, 3)
        }
    
    def _get_priority_level(self, score: float) -> str:
        """
        Get priority level from score using optimized threshold checking
        Ordered from highest to lowest for early exit optimization
        """
        if score >= self.thresholds['critical']:
            return 'critical'
        elif score >= self.thresholds['high']:
            return 'high'
        elif score >= self.thresholds['medium']:
            return 'medium'
        else:
            return 'low'


# Global instance
priority_predictor = PriorityPredictor()
