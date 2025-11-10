from app.models.duplicate_detector import duplicate_detector
from app.models.priority_predictor import priority_predictor
from app.utils.database import db
from datetime import datetime, timedelta

class AIService:
    """Main AI service for issue analysis"""
    
    async def analyze_issue(self, issue_data):
        """Comprehensive issue analysis"""
        
        # Combine title and description for analysis
        text = f"{issue_data['title']} {issue_data['description']}"
        
        # Use the category provided by the user
        category = issue_data['category']
        
        # 1. Generate tags
        tags = self._generate_tags(text, category)
        
        # 2. Check for duplicates
        existing_issues = await self._get_similar_issues(
            category,
            issue_data['location']['coordinates']
        )
        
        duplicate_result = await duplicate_detector.find_duplicates(
            text,
            issue_data['location']['coordinates'][::-1],  # [lat, lon]
            existing_issues
        )
        
        # 3. Predict priority
        priority_result = priority_predictor.predict_priority(
            category,
            upvote_count=0,  # New issue
            verification_count=0,
            age_days=0
        )
        
        return {
            'predictedCategory': category,
            'confidence': 1.0,  # User-selected category
            'tags': tags,
            'isDuplicate': duplicate_result['isDuplicate'],
            'duplicateOf': duplicate_result.get('duplicateOf'),
            'similarity': duplicate_result.get('similarity', 0),
            'priority': priority_result['priority'],
            'priorityScore': priority_result['score'],
            'estimatedResolutionTime': None
        }
    
    async def _get_similar_issues(self, category, location, radius_km=5):
        """Get similar issues from database"""
        try:
            database = db.get_db()
            if not database:
                return []
            
            issues_collection = database.issues
            
            # Find issues in the same category within radius
            issues = await issues_collection.find({
                'category': category,
                'status': {'$in': ['pending', 'verified', 'assigned', 'in-progress']},
                'location': {
                    '$near': {
                        '$geometry': {
                            'type': 'Point',
                            'coordinates': location
                        },
                        '$maxDistance': radius_km * 1000
                    }
                }
            }).limit(20).to_list(20)
            
            # Format for duplicate detection
            formatted_issues = []
            for issue in issues:
                formatted_issues.append({
                    'id': str(issue['_id']),
                    'text': f"{issue['title']} {issue['description']}",
                    'location': issue['location']['coordinates'][::-1]  # [lat, lon]
                })
            
            return formatted_issues
        except Exception as e:
            print(f"Error fetching similar issues: {e}")
            return []
    
    def _generate_tags(self, text, category):
        """Generate tags from issue text using optimized set operations"""
        text_lower = text.lower()
        
        # Category-specific tags
        tag_keywords = {
            'pothole': ['damaged', 'repair', 'road', 'urgent'],
            'streetlight': ['dark', 'not working', 'broken', 'night'],
            'garbage': ['cleanup', 'sanitation', 'smell', 'health'],
            'water': ['supply', 'leak', 'shortage', 'pipe'],
            'sewage': ['drainage', 'overflow', 'smell', 'health'],
            'traffic': ['congestion', 'signal', 'safety', 'accident'],
            'park': ['maintenance', 'green', 'public space'],
            'building': ['illegal', 'safety', 'construction']
        }
        
        # Use set for O(1) addition and automatic deduplication
        tags = {category}
        
        # Add relevant tags
        keywords = tag_keywords.get(category, [])
        for keyword in keywords:
            if keyword in text_lower:
                tags.add(keyword)
        
        # Urgency keywords - use set for faster lookup
        urgency_words = {'urgent', 'emergency', 'dangerous', 'critical'}
        safety_words = {'safety', 'danger', 'risk', 'hazard'}
        
        # Split text into words once for efficient searching
        text_words = set(text_lower.split())
        
        # Check for urgency and safety tags using set intersection
        if text_words & urgency_words:
            tags.add('urgent')
        
        if text_words & safety_words:
            tags.add('safety')
        
        # Return up to 5 unique tags (already unique due to set)
        return list(tags)[:5]


# Global instance
ai_service = AIService()
