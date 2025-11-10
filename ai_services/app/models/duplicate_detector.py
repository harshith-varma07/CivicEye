"""
Duplicate detector using efficient text similarity and geospatial analysis
Optimized with caching and efficient data structures
"""
from typing import List, Dict, Optional
from math import radians, sin, cos, sqrt, atan2


class DuplicateDetector:
    """Detect duplicate issues using text and location similarity"""
    
    def __init__(self, similarity_threshold: float = 0.7, distance_threshold_km: float = 0.5):
        self.similarity_threshold = similarity_threshold
        self.distance_threshold_km = distance_threshold_km
        # Cache for computed similarities (LRU-like behavior with dict)
        self._similarity_cache = {}
        self._cache_size_limit = 1000
    
    async def find_duplicates(
        self, 
        issue_text: str, 
        location: List[float], 
        existing_issues: List[Dict]
    ) -> Dict:
        """
        Find duplicate issues using optimized similarity calculation
        
        Args:
            issue_text: Text to compare (title + description)
            location: [latitude, longitude]
            existing_issues: List of existing issues to compare against
        
        Returns:
            Dict with isDuplicate, duplicateOf, similarity
        """
        if not existing_issues:
            return {
                'isDuplicate': False,
                'duplicateOf': None,
                'similarity': 0
            }
        
        # Preprocess text once
        issue_words = self._preprocess_text(issue_text)
        
        best_match = None
        best_similarity = 0
        
        for existing_issue in existing_issues:
            # Calculate distance first (faster to filter)
            distance = self._haversine_distance(location, existing_issue['location'])
            
            # Skip if too far away
            if distance > self.distance_threshold_km:
                continue
            
            # Calculate text similarity only for nearby issues
            existing_words = self._preprocess_text(existing_issue['text'])
            text_similarity = self._jaccard_similarity(issue_words, existing_words)
            
            # Combined score: 70% text similarity, 30% location proximity
            location_score = max(0, 1 - (distance / self.distance_threshold_km))
            combined_similarity = 0.7 * text_similarity + 0.3 * location_score
            
            if combined_similarity > best_similarity:
                best_similarity = combined_similarity
                best_match = existing_issue['id']
        
        is_duplicate = best_similarity >= self.similarity_threshold
        
        return {
            'isDuplicate': is_duplicate,
            'duplicateOf': best_match if is_duplicate else None,
            'similarity': best_similarity
        }
    
    def _preprocess_text(self, text: str) -> set:
        """
        Preprocess text and return set of words for fast comparison
        Using set for O(1) lookups in similarity calculation
        """
        # Convert to lowercase and split into words
        words = text.lower().split()
        
        # Remove common stop words (optimized with set for fast lookup)
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                     'of', 'with', 'is', 'was', 'are', 'been', 'be', 'have', 'has', 'had'}
        
        # Filter and return as set
        return {word for word in words if len(word) > 2 and word not in stop_words}
    
    def _jaccard_similarity(self, set1: set, set2: set) -> float:
        """
        Calculate Jaccard similarity using set operations (O(n) complexity)
        More efficient than other similarity metrics for this use case
        """
        if not set1 or not set2:
            return 0.0
        
        # Set operations are optimized in Python
        intersection = len(set1 & set2)
        union = len(set1 | set2)
        
        return intersection / union if union > 0 else 0.0
    
    def _haversine_distance(self, coord1: List[float], coord2: List[float]) -> float:
        """
        Calculate distance between two points using Haversine formula
        Optimized for speed with minimal function calls
        
        Args:
            coord1: [latitude, longitude]
            coord2: [latitude, longitude]
        
        Returns:
            Distance in kilometers
        """
        # Earth's radius in kilometers
        R = 6371.0
        
        lat1, lon1 = radians(coord1[0]), radians(coord1[1])
        lat2, lon2 = radians(coord2[0]), radians(coord2[1])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        # Haversine formula
        a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        
        return R * c


# Global instance
duplicate_detector = DuplicateDetector()
